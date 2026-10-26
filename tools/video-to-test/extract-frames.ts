// npx ts-node tools/video-to-test/extract-frames.ts recordings/<file>.mp4 [--fps 2] [--max 80] [--width 1280]
//
// Pulls the "interesting" frames out of a screen recording so they can be read step by step.
// Samples the video at --fps, drops frames that look the same as the previous one (ffmpeg's
// mpdecimate), and writes them plus a manifest with timestamps to recordings/work/<video-name>/.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';

type Options = { video: string; fps: number; max: number; width: number };

function parseArgs(argv: string[]): Options {
    const opts: Options = { video: '', fps: 2, max: 80, width: 1280 };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--fps') opts.fps = Number(argv[++i]);
        else if (arg === '--max') opts.max = Number(argv[++i]);
        else if (arg === '--width') opts.width = Number(argv[++i]);
        else opts.video = arg;
    }
    return opts;
}

function runFfmpeg(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(ffmpegPath as string, args, { windowsHide: true });
        let stderr = '';
        proc.stderr.on('data', (d) => (stderr += d));
        proc.on('close', (code) =>
            code === 0 ? resolve(stderr) : reject(new Error(`ffmpeg exited ${code}\n${stderr.slice(-2000)}`)),
        );
    });
}

async function extract(video: string, outDir: string, fps: number, width: number) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    // Higher thresholds than mpdecimate's defaults so a blinking cursor or a spinning loader
    // doesn't count as a change, but a typed character, an opened dropdown or a toast does.
    const filter = `fps=${fps},mpdecimate=hi=64*24:lo=64*8:frac=0.2,scale='min(${width},iw)':-2,showinfo`;
    const stderr = await runFfmpeg([
        '-hide_banner', '-i', video,
        '-vf', filter, '-fps_mode', 'vfr', '-q:v', '3',
        path.join(outDir, 'frame_%04d.jpg'),
    ]);

    // tsconfig targets es2016, so no String.matchAll — walk the matches with exec().
    const times: number[] = [];
    const ptsRegex = /pts_time:\s*([\d.]+)/g;
    let match: RegExpExecArray | null;
    while ((match = ptsRegex.exec(stderr)) !== null) times.push(Number(match[1]));
    const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    const duration = durationMatch
        ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
        : null;
    const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.jpg')).sort();
    return { files, times, duration };
}

(async () => {
    const { video, fps, max, width } = parseArgs(process.argv.slice(2));
    if (!video || !fs.existsSync(video)) {
        console.error('Usage: npx ts-node tools/video-to-test/extract-frames.ts <recording.mp4> [--fps 2] [--max 80] [--width 1280]');
        process.exit(1);
    }

    const name = path.basename(video, path.extname(video));
    const workDir = path.join('recordings', 'work', name);
    const framesDir = path.join(workDir, 'frames');

    // Busy recordings: halve the sample rate until we're under --max frames.
    let currentFps = fps;
    let result = await extract(video, framesDir, currentFps, width);
    while (result.files.length > max && currentFps > 0.25) {
        currentFps = currentFps / 2;
        console.log(`${result.files.length} frames > ${max}; retrying at ${currentFps} fps`);
        result = await extract(video, framesDir, currentFps, width);
    }

    const toPosix = (p: string) => p.split(path.sep).join('/');
    const frames = result.files.map((file, i) => ({
        file: toPosix(path.join(framesDir, file)),
        time: result.times[i] != null ? Number(result.times[i].toFixed(2)) : null,
    }));
    const manifest = {
        video: toPosix(video),
        durationSeconds: result.duration,
        sampledFps: currentFps,
        frameCount: frames.length,
        frames,
    };
    fs.writeFileSync(path.join(workDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log(`✅ Extracted ${frames.length} key frames from ${video} (${result.duration?.toFixed(1)}s)`);
    console.log(`   Manifest: ${toPosix(path.join(workDir, 'manifest.json'))}`);
})().catch((error) => {
    console.error('❌', error.message);
    process.exit(1);
});
