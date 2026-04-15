precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;

const vec3 WAVE_COLOR_1 = vec3(0.388, 0.4, 0.945);   // accent indigo
const vec3 WAVE_COLOR_2 = vec3(0.3, 0.75, 0.65);      // teal
const vec3 WAVE_COLOR_3 = vec3(0.6, 0.35, 0.85);      // purple

const vec3 GRID_COLOR = vec3(0.16, 0.16, 0.23);       // border-subtle range

// Composite sine wave with harmonics
float waveform(float x, float t, float baseFreq, float speed, float phase) {
  float y = 0.0;
  y += sin(x * baseFreq + t * speed + phase) * 0.5;
  y += sin(x * baseFreq * 2.3 + t * speed * 1.3 + phase * 0.7) * 0.25;
  y += sin(x * baseFreq * 4.1 + t * speed * 0.7 + phase * 1.4) * 0.125;
  y += sin(x * baseFreq * 7.0 + t * speed * 1.8 + phase * 2.1) * 0.0625;
  return y;
}

void main() {
  float aspect = uResolution.x / uResolution.y;

  // Background grid
  float gridX = smoothstep(0.0, 0.015, abs(fract(vUv.x * 20.0) - 0.5) - 0.48);
  float gridY = smoothstep(0.0, 0.015, abs(fract(vUv.y * 10.0) - 0.5) - 0.48);
  float grid = (1.0 - gridX) + (1.0 - gridY);
  grid *= 0.03;

  vec3 color = GRID_COLOR * grid;
  float alpha = grid * 0.5;

  // Mouse influence
  float mouseAmplitude = 1.0 + (uMouse.y - 0.5) * 0.8;
  float mouseFreqX = uMouse.x;

  // Three waveform layers
  float x = vUv.x * 6.2831853; // 0..2pi mapped across width
  float y = vUv.y;

  // Local frequency modulation near mouse X
  float freqMod = exp(-pow((vUv.x - mouseFreqX) * 4.0, 2.0)) * 0.3;

  // Wave 1 — primary signal (center)
  float wave1 = waveform(x + freqMod * 10.0, uTime, 1.0, 1.2, 0.0) * 0.12 * mouseAmplitude;
  float dist1 = abs(y - 0.5 - wave1);
  float core1 = exp(-dist1 * 300.0);
  float glow1 = exp(-dist1 * 30.0) * 0.3;
  color += (core1 + glow1) * WAVE_COLOR_1;
  alpha += (core1 + glow1 * 0.5);

  // Wave 2 — secondary (slightly above center)
  float wave2 = waveform(x + freqMod * 8.0, uTime, 1.5, 0.8, 2.094) * 0.08 * mouseAmplitude;
  float dist2 = abs(y - 0.55 - wave2);
  float core2 = exp(-dist2 * 300.0);
  float glow2 = exp(-dist2 * 30.0) * 0.25;
  color += (core2 + glow2) * WAVE_COLOR_2 * 0.7;
  alpha += (core2 + glow2 * 0.4) * 0.7;

  // Wave 3 — tertiary (slightly below center)
  float wave3 = waveform(x + freqMod * 12.0, uTime, 2.0, 1.5, 4.189) * 0.06 * mouseAmplitude;
  float dist3 = abs(y - 0.45 - wave3);
  float core3 = exp(-dist3 * 300.0);
  float glow3 = exp(-dist3 * 30.0) * 0.2;
  color += (core3 + glow3) * WAVE_COLOR_3 * 0.5;
  alpha += (core3 + glow3 * 0.3) * 0.5;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
