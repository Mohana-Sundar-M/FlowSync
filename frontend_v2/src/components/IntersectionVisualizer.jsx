import React from 'react';

function IntersectionVisualizer({ phase, timer, type = 'cross' }) {
  // Directly map the Backend's Master Clock to the CSS UI
  const nsLight = phase === 'NS_GREEN' ? 'green' : phase === 'NS_YELLOW' ? 'yellow' : 'red';
  const ewLight = phase === 'EW_GREEN' ? 'green' : phase === 'EW_YELLOW' ? 'yellow' : 'red';

  const SignalPost = ({ state, rotation }) => (
    <div className={`signal-post rotate-${rotation}`}>
      <div className={`light red ${state === 'red' ? 'on' : ''}`}></div>
      <div className={`light yellow ${state === 'yellow' ? 'on' : ''}`}></div>
      <div className={`light green ${state === 'green' ? 'on' : ''}`}></div>
    </div>
  );

  if (type === 'roundabout') {
    return (
      <div className="intersection-container roundabout-container">
        {/* Outer Ring */}
        <div className="roundabout-circle">
          <div className="roundabout-center">
            <div className="timer-overlay" style={{ fontSize: '1.5rem' }}>{timer}s</div>
          </div>
        </div>
        
        {/* Entry Roads */}
        <div className="entry-road entry-top"></div>
        <div className="entry-road entry-bottom"></div>
        <div className="entry-road entry-left"></div>
        <div className="entry-road entry-right"></div>

        {/* 4 Traffic Light Posts stationed at entry points */}
        <div className="post-wrapper top"><SignalPost state={nsLight} rotation="180" /></div>
        <div className="post-wrapper bottom"><SignalPost state={nsLight} rotation="0" /></div>
        <div className="post-wrapper left"><SignalPost state={ewLight} rotation="90" /></div>
        <div className="post-wrapper right"><SignalPost state={ewLight} rotation="270" /></div>
        
        {/* Simulating circular flow */}
        {phase.includes('GREEN') && <div className="sim-car roundabout-car-1" />}
        {phase.includes('GREEN') && <div className="sim-car roundabout-car-2" />}
      </div>
    );
  }

  return (
    <div className="intersection-container">
      <div className="road vertical-road">
        <div className="road-line dashed"></div>
      </div>
      <div className="road horizontal-road">
        <div className="road-line dashed"></div>
      </div>
      
      {/* Intersection Center Box */}
      <div className="intersection-center">
        <div className="timer-overlay">{timer}s</div>
      </div>

      {/* 4 Traffic Light Posts */}
      <div className="post-wrapper top"><SignalPost state={nsLight} rotation="180" /></div>
      <div className="post-wrapper bottom"><SignalPost state={nsLight} rotation="0" /></div>
      <div className="post-wrapper left"><SignalPost state={ewLight} rotation="90" /></div>
      <div className="post-wrapper right"><SignalPost state={ewLight} rotation="270" /></div>
      
      {/* Visual Simulated Cars */}
      {nsLight === 'green' && <div className="sim-car ns-car-1" />}
      {nsLight === 'green' && <div className="sim-car ns-car-2" />}
      {ewLight === 'green' && <div className="sim-car ew-car-1" />}
      {ewLight === 'green' && <div className="sim-car ew-car-2" />}
    </div>
  );
}

export default IntersectionVisualizer;
