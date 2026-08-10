precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform float u_time;
uniform int u_mode;

#define PI 3.14159265359

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 renderComplexDomain(vec2 z) {
  vec2 z3 = vec2(z.x*z.x*z.x - 3.0*z.x*z.y*z.y, 3.0*z.x*z.x*z.y - z.y*z.y*z.y);
  vec2 fz = z3 - vec2(1.0 - 0.3 * sin(u_time), 0.0);

  float r = length(fz);
  float theta = atan(fz.y, fz.x);
  if (theta < 0.0) theta += 2.0 * PI;

  float logR = log(r + 1.0);
  float val = 0.5 + 0.5 * sin(2.0 * PI * logR);
  float grid = abs(fract(logR * 2.0 - 0.5) - 0.5) / fwidth(logR * 2.0);
  val *= clamp(grid, 0.4, 1.0);

  return hsl2rgb(vec3(theta / (2.0 * PI), 0.85, clamp(val * 0.6, 0.15, 0.85)));
}

vec3 renderFractal(vec2 c) {
  vec2 z = c;
  float n = 0.0;
  for (float i = 0.0; i < 128.0; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    n += 1.0;
  }
  if (n >= 128.0) return vec3(0.0);
  float nu = log(log(dot(z, z)) / 2.0) / log(2.0);
  return hsl2rgb(vec3((n + 1.0 - nu) * 0.05 + u_time * 0.05, 0.8, 0.5));
}

vec3 renderFlowField(vec2 p) {
  vec2 v = vec2(sin(p.y + u_time), cos(p.x + u_time));
  float speed = length(v);
  float angle = atan(v.y, v.x);
  if (angle < 0.0) angle += 2.0 * PI;
  vec3 baseColor = hsl2rgb(vec3(angle / (2.0 * PI), 0.7, 0.5 * speed));
  vec2 st = fract(p);
  float lines = step(0.95, st.x) + step(0.95, st.y);
  return mix(baseColor, vec3(1.0), lines * 0.3);
}

vec3 renderLinearTransform(vec2 p) {
  float a = u_time * 0.5;
  mat2 m = mat2(cos(a), sin(a), -sin(a), cos(a));
  vec2 transformed = m * p;
  vec2 grid = abs(fract(transformed - 0.5) - 0.5) / fwidth(transformed);
  float line = min(grid.x, grid.y);
  float color = 1.0 - min(line, 1.0);
  vec3 axisColor = vec3(0.1, 0.1, 0.15);
  if (abs(transformed.x) < 0.05) axisColor = vec3(0.2, 0.8, 1.0);
  if (abs(transformed.y) < 0.05) axisColor = vec3(1.0, 0.3, 0.4);
  return mix(axisColor, vec3(0.9), color);
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 pos = st * u_zoom + u_offset;

  vec3 col = vec3(0.0);
  if (u_mode == 0) col = renderComplexDomain(pos);
  else if (u_mode == 1) col = renderFractal(pos);
  else if (u_mode == 2) col = renderFlowField(pos);
  else if (u_mode == 3) col = renderLinearTransform(pos);

  gl_FragColor = vec4(col, 1.0);
}
