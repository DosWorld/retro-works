#!/usr/bin/env python3
import sys, subprocess, os, multiprocessing, magic, tempfile, getopt;
OUTPUT_CUE='audiocd.cue';
OUTPUT_AUDIO='audiocd.wav';

opts, args = getopt.getopt(sys.argv[1:], 'o:');
for k,v in opts:
    if (k == '-o'):
        OUTPUT_CUE = v+'.cue';
        OUTPUT_AUDIO = v+'.wav';

files = args;
tempfiles = [];

mime = magic.open(magic.MIME);
mime.load();
for i in range(len(files)):
    mime_type = mime.file(files[i]).split(';')[0];
    if (mime_type in ('audio/mpeg')):
        tf = tempfile.NamedTemporaryFile(prefix='%02d-'%(i+1), suffix='.wav', delete=False);
        tf.close();
        tempfiles.append(tf.name);
        plame = subprocess.Popen(['/usr/bin/lame', '--decode', files[i], tf.name]);
        if (0 == plame.wait()):
            files[i] = tf.name;
mime.close();

pwav = subprocess.Popen(['/usr/bin/shntool', 'join'] + files + ['-o', 'wav', '-O', 'always']);
pcue = subprocess.Popen(
    ['/usr/bin/shntool', 'cue']+files,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
);
stdout, stderr = pcue.communicate();
sys.stderr.write(stderr.decode('UTF-8'));
with open(OUTPUT_CUE, 'w') as f:
    f.write(stdout.decode('UTF-8').replace('joined.wav', OUTPUT_AUDIO).replace('WAVE', 'BINARY'));
pwav.wait();
os.rename('joined.wav', OUTPUT_AUDIO);

for f in tempfiles:
    os.unlink(f);
