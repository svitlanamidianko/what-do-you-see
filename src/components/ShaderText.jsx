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

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function rgbToHex(rgb) {
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function ShaderText({ text, className }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textId = `text-mask-${Math.random().toString(36).substr(2, 9)}`;
  
  const [controls] = useState({
    speed: 3.1,
    bands: 37.0,
    colorMix: 0.44,
    color1: [0.549, 0.357, 0.682],
    color2: [0.694, 0.678, 0.776],
    fontFamily: 'fantasy',
    fontWeight: 300,
    fontStyle: 'normal'
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    updateSize();

    const program = createShaderProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    
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
      gl.deleteProgram(program);
    };
  }, [controls]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '180px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        paddingLeft: '2rem',
        marginTop: '-2rem'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg 
          width="100%"
          height="100%"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        >
          <defs>
            <mask id={textId}>
              <rect width="100%" height="100%" fill="black" />
              <text
                x="0"
                y="80px"
                textAnchor="start"
                dominantBaseline="middle"
                fontSize="96px"
                fill="white"
                fontFamily={controls.fontFamily}
                style={{
                  fontWeight: controls.fontWeight,
                  fontStyle: controls.fontStyle
                }}
              >
                {text}
              </text>
            </mask>
          </defs>
        </svg>

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            mask: `url(#${textId})`,
            WebkitMask: `url(#${textId})`
          }}
        />
      </div>
    </div>
  );
}

function createShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default ShaderText; 