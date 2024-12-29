import React, { useEffect, useRef, useState } from 'react';

const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform float time;
  uniform float speed;
  uniform float bands;
  uniform float colorMix;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    float pattern = sin(uv.x * bands + time * speed) * 0.5 + 0.5;
    float movement = sin(uv.y * 4.0 - time * speed) * 0.5 + 0.5;
    vec3 color = mix(color1, color2, pattern * movement * colorMix);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderText({ text, className }) {
  const canvasRef = useRef(null);
  const textId = `text-mask-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add controls state
  const [controls, setControls] = useState({
    speed: 1.0,
    bands: 20.0,
    colorMix: 0.5,
    color1: [0.4, 0.3, 0.5], // purple
    color2: [0.3, 0.4, 0.2], // green
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight * 0.4; // Increased height
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };
    updateSize();

    const program = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
       1, -1,  -1, 1,   1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    const timeLocation = gl.getUniformLocation(program, 'time');
    const speedLocation = gl.getUniformLocation(program, 'speed');
    const bandsLocation = gl.getUniformLocation(program, 'bands');
    const colorMixLocation = gl.getUniformLocation(program, 'colorMix');
    const color1Location = gl.getUniformLocation(program, 'color1');
    const color2Location = gl.getUniformLocation(program, 'color2');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let animationFrameId;
    const startTime = Date.now();

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      
      gl.uniform1f(timeLocation, time);
      gl.uniform1f(speedLocation, controls.speed);
      gl.uniform1f(bandsLocation, controls.bands);
      gl.uniform1f(colorMixLocation, controls.colorMix);
      gl.uniform3fv(color1Location, controls.color1);
      gl.uniform3fv(color2Location, controls.color2);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [controls]);

  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <defs>
          <mask id={textId}>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6rem"
              fontWeight="bold"
              fill="white"
              fontFamily="serif"
            >
              {text}
            </text>
          </mask>
        </defs>
      </svg>

      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: '40vh',
          maskImage: `url(#${textId})`,
          WebkitMaskImage: `url(#${textId})`,
        }}
      />

      {/* Simple Control Panel */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        zIndex: 1000
      }}>
        <div>
          <label>Speed: {controls.speed.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={controls.speed}
            onChange={(e) => setControls({...controls, speed: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <label>Bands: {controls.bands.toFixed(1)}</label>
          <input
            type="range"
            min="1"
            max="50"
            step="0.5"
            value={controls.bands}
            onChange={(e) => setControls({...controls, bands: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <label>Color Mix: {controls.colorMix.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={controls.colorMix}
            onChange={(e) => setControls({...controls, colorMix: parseFloat(e.target.value)})}
          />
        </div>
      </div>
    </div>
  );
}

function createShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default ShaderText; 