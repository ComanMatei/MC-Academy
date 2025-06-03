import { useState, useEffect } from 'react';
import click1 from './click1.mp3';
import click2 from './click2.mp3';
import MetronomeCSS from './metronome.module.css'

const Metronome = () => {
    const [bpm, setBpm] = useState(140);
    const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
    const [isRunning, setIsRunning] = useState(false);
    const [count, setCount] = useState(0);

    const click1Audio = new Audio(click1);
    const click2Audio = new Audio(click2);

    useEffect(() => {
        let timer;
        if (isRunning) {
            timer = setInterval(playClick, 60000 / bpm);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isRunning, bpm]);

    const playClick = () => {
        setCount(prevCount => {
            const newCount = (prevCount + 1) % beatsPerMeasure;
            if (newCount === 0) {
                click1Audio.play();
            } else {
                click2Audio.play();
            }
            return newCount;
        });
    };

    return (
        <div className={MetronomeCSS.container}>
            <div className={MetronomeCSS.metronome}>
                <div className={MetronomeCSS.bpmDisplay}>
                    <span className={MetronomeCSS.tempo}>{bpm}</span>
                    <span className={MetronomeCSS.bpm}>BPM</span>
                </div>
                <div className={MetronomeCSS.tempoSettings}>
                    <div className={MetronomeCSS.decreaseTempo} onClick={() => setBpm(prev => Math.max(20, prev - 1))}>-</div>
                    <input
                        type="range"
                        min="20"
                        max="280"
                        step="1"
                        className={MetronomeCSS.slider}
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                    />
                    <div className={MetronomeCSS.increaseTempo} onClick={() => setBpm(prev => Math.min(280, prev + 1))}>+</div>
                </div>
                <div className={MetronomeCSS.startStop} onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? 'STOP' : 'START'}
                </div>
                <div className={MetronomeCSS.measures}>
                    <div className={MetronomeCSS.subtractBeats} onClick={() => setBeatsPerMeasure(prev => Math.max(2, prev - 1))}>-</div>
                    <div className={MetronomeCSS.measureCount}>{beatsPerMeasure}</div>
                    <div className={MetronomeCSS.addBeats} onClick={() => setBeatsPerMeasure(prev => Math.min(12, prev + 1))}>+</div>
                </div>
                <span className={MetronomeCSS.beatsPerMeasureText}>Beats per measure</span>
            </div>
        </div>
    );
};

export default Metronome;