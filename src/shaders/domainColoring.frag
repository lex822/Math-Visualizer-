uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_time;
uniform bool u_showContours;

varying vec2 vUv;

#define PI 3.14159265359

// HSL to RGB conversion for Domain Coloring
vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

// Example complex function: f(z) = z^3 - 1 + sin(t)
vec2 complexFunc(vec2 z, float t) {
  // z^3 = (x + iy)^3
  float x = z.x;
  float y = z.y;
  vec2 z3 = vec2(x*x*x - 3.0*x*y*y, 3.0*x*x*y - y*y*y);
  return z3 - vec2(1.0 - 0.3 * sin(t), 0.0);
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 z = st * u_zoom + u_offset;

  vec2 fz = complexFunc(z, u_time);

  float r = length(fz);
  float theta = atan(fz.y, fz.x); // -PI to PI
  if (theta < 0.0) theta += 2.0 * PI;

  // Hue from phase theta (0 to 1)
  float hue = theta / (2.0 * PI);
  
  // Brightness grid based on log magnitude
  float logR = log(r + 1.0);
  float val = 0.5 + 0.5 * sin(2.0 * PI * logR);
  
  if (u_showContours) {
    float grid = abs(fract(logR * 2.0 - 0.5) - 0.5) / fwidth(logR * 2.0);
    val *= clamp(grid, 0.4, 1.0);
  }

  vec3 rgb = hsl2rgb(vec3(hue, 0.85, clamp(val * 0.6, 0.15, 0.85)));
  gl_FragColor = vec4(rgb, 1.0);
}
