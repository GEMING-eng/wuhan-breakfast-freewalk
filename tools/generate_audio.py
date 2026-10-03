"""Original procedural ambience. No recordings or third-party samples. Python standard library."""
import math, random, wave, struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'public'/'assets'/'audio'
ROOT.mkdir(parents=True,exist_ok=True)
SR=22050
def save(name, data):
    with wave.open(str(ROOT/(name+'.wav')),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*32767)) for v in data))
def ambience(period):
    rng=random.Random(314 if period=='past' else 628);n=SR*30;data=[];low=0
    for i in range(n):
        t=i/SR;low=.985*low+.015*rng.uniform(-1,1)
        # quiet wind / distant street wash, not language or asserted historical recording
        val=.12*low+.009*math.sin(2*math.pi*(96 if period=='past' else 120)*t)
        val*=.8+.2*math.sin(2*math.pi*t/30)
        edge=min(1,t/.25,(30-t)/.25);data.append(val*edge)
    for sec,freq in [(3,1600),(9,1800),(18,1400),(25,1750)]:
        for i in range(int(.28*SR)):
            t=i/SR;phase=2*math.pi*(freq*t+350*t*t)
            data[int(sec*SR)+i]+=.019*math.sin(phase)*math.sin(math.pi*t/.28)**2
    for sec in [5,5.6,14,14.65,22]:
        for i in range(int(.12*SR)):
            t=i/SR;data[int(sec*SR)+i]+=.024*math.sin(2*math.pi*180*t)*math.exp(-t*40)*math.sin(math.pi*t/.12)
    save('ambient-'+period,data)
ambience('present');ambience('past')
save('choice',[.095*math.sin(2*math.pi*630*i/SR)*math.exp(-i/SR*25)*math.sin(math.pi*i/(SR*.18)) for i in range(int(SR*.18))])
rng=random.Random(17)
save('paper',[.04*rng.uniform(-1,1)*math.sin(math.pi*i/(SR*.5))**2 for i in range(int(SR*.5))])
print('Generated four original WAV assets.')
