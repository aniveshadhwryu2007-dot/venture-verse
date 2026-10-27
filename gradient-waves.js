/**
 * GradientWaves — Vanilla JS/WebGL2 port of the React Bits GradientWaves component.
 * Ported from the original React implementation at reactbits.dev.
 * Designed for the Venture Verse event cards section (no React, no build tools).
 *
 * Usage:
 *   const instance = createGradientWaves(containerElement, options);
 *   instance.destroy(); // clean up
 */
(function (global) {
  'use strict';

  /* ── Constants ── */
  const MAX_SWELLS    = 4;
  const SWELL_SECONDS = 3.2;
  const SWELL_GAIN    = 2.8;
  const SWELL_WIDTH   = 8;
  const INTRO_SECONDS = 2.6;
  const CAMERA_HEIGHT = 30;
  const QUALITY       = { low: 56, medium: 84, high: 120 };

  /* ── Shader Sources ── */
  const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2  uResolution;
uniform float uTime;
uniform float uClock;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uHeight;
uniform float uTilt;
uniform float uZoom;
uniform vec2  uLook;
uniform float uFogDepth;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform vec3  uHorizon;
uniform vec3  uWave;
uniform vec3  uCrest;
uniform vec3  uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec3  uSun;
uniform float uRelief;
uniform float uSheen;
uniform float uSteps;
uniform float uStride;
uniform vec3  uIntro;
uniform vec3  uSwells[${MAX_SWELLS}];
uniform float uSwellWidth;
out vec4 outColor;

const float FAR = 4000.0;

float hash(vec2 p){
  vec3 p3=fract(vec3(p.xyx)*0.1031);
  p3+=dot(p3,p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}

vec3 surface(vec2 xy){
  vec2 freq=vec2(uWaveScale/7.0,(uWaveScale*uWaveRatio)/3.0);
  vec4 tc=vec4(uTime/0.130,uTime/0.810,uTime/0.200,uTime/0.710);
  float a=xy.x+tc.x;
  float swellPhase=(xy.y+a)/20.0+tc.y;
  float bend=uSwell*cos(swellPhase)/20.0;
  float mx=a+uSwell*sin(swellPhase);
  float crossPhase=xy.x/23.0+tc.w;
  float my=xy.y-tc.z+uTurbulence*cos(crossPhase);
  float twist=-uTurbulence*sin(crossPhase)/23.0;
  float cx2=cos(mx*freq.x);
  float cy2=cos(my*freq.y);
  float rise=1.0;
  if(uIntro.z>0.0)rise=mix(1.0,smoothstep(uIntro.y*0.45,uIntro.y*1.6,xy.x),uIntro.z);
  float amp=uAmplitude*rise;
  float h=(sin(mx*freq.x)+sin(my*freq.y))*amp+uHeight;
  float dx=amp*(freq.x*cx2*(1.0+bend)+freq.y*cy2*twist);
  float dy=amp*(freq.x*cx2*bend+freq.y*cy2);
  for(int k=0;k<${MAX_SWELLS};k++){
    vec3 sw=uSwells[k];
    if(sw.z<=0.0)continue;
    float u2=(xy.x-sw.x)/uSwellWidth;
    float v2=(xy.y-sw.y)/(uSwellWidth*3.5);
    float bump=sw.z*exp(-u2*u2-v2*v2);
    h+=bump;
    dx+=bump*(-2.0*u2/uSwellWidth);
    dy+=bump*(-2.0*v2/(uSwellWidth*3.5));
  }
  return vec3(h,dx,dy);
}

float march(vec3 origin,vec3 dir){
  float dist=0.0;
  for(int i=0;i<128;i++){
    if(float(i)>=uSteps)break;
    float gap=origin.z+dist*dir.z-surface(origin.xy+dist*dir.xy).x;
    if(abs(gap)<0.002*dist+0.01)break;
    dist+=uStride*gap;
    if(!(abs(dist)<FAR))return FAR;
  }
  return dist;
}

void main(){
  float c; float s;
  float vfov=(3.14159/2.3)/max(uZoom,0.05);
  vec3 cam=vec3(0.0,0.0,${CAMERA_HEIGHT.toFixed(1)});
  vec2 uv=gl_FragCoord.xy/uResolution-0.5;
  uv.x*=uResolution.x/uResolution.y;
  uv.y*=-1.0;
  vec3 dir=vec3(0.0,0.0,-1.0);
  float ulen=length(uv);
  float xrot=vfov*ulen;
  c=cos(xrot); s=sin(xrot);
  dir=mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c)*dir;
  vec2 nuv=ulen>1e-5?uv/ulen:vec2(1.0,0.0);
  dir=mat3(nuv.x,-nuv.y,0.0, nuv.y,nuv.x,0.0, 0.0,0.0,1.0)*dir;
  c=cos(uTilt+uLook.y); s=sin(uTilt+uLook.y);
  dir=mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c)*dir;
  c=cos(uLook.x); s=sin(uLook.x);
  dir=mat3(c,s,0.0, -s,c,0.0, 0.0,0.0,1.0)*dir;
  float dist=march(cam,dir);
  vec3 pos=cam+dist*dir;
  vec3 field=surface(pos.xy);
  vec3 view=-dir;
  float crest=clamp((field.x-uHeight)/max(2.0*uAmplitude,0.001)*0.5+0.5,0.0,1.0);
  vec3 body=mix(uWave,uCrest,smoothstep(0.45,1.0,crest)*0.5);
  vec3 normal=normalize(vec3(-field.yz*(1.0+1.5*uRelief),1.0));
  float diffuse=clamp(dot(normal,uSun)*0.5+0.5,0.0,1.0);
  float lightness=mix(1.0,diffuse*diffuse*(3.0-2.0*diffuse),uRelief);
  float sheen2=pow(clamp(dot(normal,normalize(uSun+view)),0.0,1.0),14.0)*uSheen*(0.4+0.6*uRelief);
  float rim=pow(1.0-clamp(dot(normal,view),0.0,1.0),3.0);
  vec3 col; float alpha;
  float haze=1.0-exp(-dist/(uFogDepth*5.0));
  float fade=1.0-smoothstep(0.35,1.0,haze);
  if(uLight<0.5){
    vec3 lit=mix(uHorizon*0.18,body,lightness)+uCrest*sheen2;
    lit=mix(lit,uHorizon,rim*0.15*uRelief);
    col=mix(lit,uHorizon,smoothstep(0.0,1.0,haze))*0.85*uBrightness;
    alpha=fade;
  } else {
    vec3 hue=mix(uHorizon,body,0.35+0.65*lightness);
    float density=mix(0.16,0.9,1.0-lightness);
    density*=1.0-clamp(sheen2,0.0,1.0)*0.85;
    density*=1.0-0.5*smoothstep(0.0,1.0,haze);
    col=hue;
    alpha=fade*clamp(density*uBrightness,0.0,1.0);
  }
  col=clamp(col,0.0,1.0);
  float grain2=(hash(gl_FragCoord.xy+fract(uClock)*64.0)-0.5)*uGrain;
  alpha=clamp(alpha*(1.0+grain2),0.0,1.0)*uOpacity;
  if(uOpaque>0.5){
    outColor=vec4(mix(uBackground,col,alpha),1.0);
  } else {
    outColor=vec4(col*alpha,alpha);
  }
}`;

  /* ── Helpers ── */
  const clampV = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const easeInOut = t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;

  let _probe = null;
  function parseColor(value, fallback) {
    if (!value || value === 'transparent') return null;
    if (!_probe) {
      try { _probe = document.createElement('canvas').getContext('2d'); } catch(e) { return fallback; }
    }
    if (!_probe) return fallback;
    _probe.fillStyle = '#000000';
    _probe.fillStyle = value;
    const text = _probe.fillStyle;
    if (text.startsWith('#')) {
      const hex = parseInt(text.slice(1), 16);
      return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
    }
    const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(text);
    if (!m) return fallback;
    if (m[4] !== undefined && Number(m[4]) === 0) return null;
    return [Number(m[1])/255, Number(m[2])/255, Number(m[3])/255];
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[GradientWaves]', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const prefersReduced = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ─────────────────────────────────────────────────────────────
     createGradientWaves(container, options) → { destroy }
  ───────────────────────────────────────────────────────────── */
  function createGradientWaves(container, opts) {
    opts = Object.assign({
      horizonColor:      '#1a0a3a',   // deep indigo matching VV theme
      waveColor:         '#2a1060',   // dark purple
      crestColor:        '#D4AF37',   // gold
      backgroundColor:   'transparent',
      lightMode:         false,
      speed:             0.32,
      amplitude:         2.0,
      waveScale:         0.55,
      waveRatio:         0.9,
      swell:             30,
      turbulence:        18,
      tilt:              62,
      zoom:              1,
      height:            5.0,
      fogDepth:          14,
      relief:            0.85,
      lightAngle:        130,
      sheen:             0,
      brightness:        1,
      opacity:           1,
      grain:             0.15,
      quality:           'medium',
      intro:             true,
      mouseInteraction:  true,
      parallaxStrength:  0.4,
      mouseStrength:     0.55,
      swellOnClick:      true,
      paused:            false,
      dpr:               1.5,
    }, opts || {});

    /* Build canvas */
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none;';
    container.style.position = container.style.position || 'relative';
    container.insertBefore(canvas, container.firstChild);

    const gl = canvas.getContext('webgl2', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, powerPreference: 'high-performance',
    });

    if (!gl) { canvas.remove(); return { destroy: () => {} }; }

    /* Compile shaders */
    const vert = compile(gl, gl.VERTEX_SHADER,   VERTEX);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vert || !frag) { canvas.remove(); return { destroy: () => {} }; }

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[GradientWaves] Link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      canvas.remove();
      return { destroy: () => {} };
    }

    /* Uniform locations */
    const UNIFORM_NAMES = [
      'uResolution','uTime','uClock','uAmplitude','uWaveScale','uWaveRatio',
      'uSwell','uTurbulence','uHeight','uTilt','uZoom','uLook','uFogDepth',
      'uBrightness','uOpacity','uGrain','uHorizon','uWave','uCrest',
      'uBackground','uOpaque','uLight','uSun','uRelief','uSheen',
      'uSteps','uStride','uIntro','uSwells','uSwellWidth',
    ];
    const u = {};
    UNIFORM_NAMES.forEach(n => { u[n] = gl.getUniformLocation(program, n); });

    /* Full-screen triangle */
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const swellData = new Float32Array(MAX_SWELLS * 3);

    const state = {
      w: 1, h: 1, cssW: 0, cssH: 0,
      time: 0, clock: 0, last: 0, raf: 0,
      visible: false, introAt: -1,
      pointer: [0.5, 0.5], inside: false,
      look: [0, 0], steer: [0, 0],
      swells: [], quiet: 0, seen: null,
    };

    function fit() {
      const ratio = Math.min(window.devicePixelRatio || 1, opts.dpr);
      const nw = Math.max(1, Math.round(state.cssW * ratio));
      const nh = Math.max(1, Math.round(state.cssH * ratio));
      if (nw === state.w && nh === state.h) return;
      state.quiet = 0; state.w = nw; state.h = nh;
      canvas.width = nw; canvas.height = nh;
    }

    function measure() {
      state.cssW = container.clientWidth;
      state.cssH = container.clientHeight;
      fit(); wake();
    }

    function introProgress() {
      if (!opts.intro || state.introAt < 0) return 1;
      return clampV((state.clock - state.introAt) / INTRO_SECONDS, 0, 1);
    }

    function render() {
      const horizon   = parseColor(opts.horizonColor, [0.1, 0.04, 0.23]) || [0.1, 0.04, 0.23];
      const wave      = parseColor(opts.waveColor,    [0.16, 0.06, 0.38]) || [0.16, 0.06, 0.38];
      const crest     = parseColor(opts.crestColor,   [0.83, 0.69, 0.22]) || [0.83, 0.69, 0.22];
      const paper     = parseColor(opts.backgroundColor, null);
      const tiltRad   = (clampV(opts.tilt, 10, 85) * Math.PI) / 180;
      const lightRad  = (opts.lightAngle * Math.PI) / 180;

      gl.viewport(0, 0, state.w, state.h);
      gl.uniform2f(u.uResolution,  state.w, state.h);
      gl.uniform1f(u.uTime,        state.time);
      gl.uniform1f(u.uClock,       state.clock);
      gl.uniform1f(u.uAmplitude,   Math.max(0, opts.amplitude));
      gl.uniform1f(u.uWaveScale,   Math.max(0.01, opts.waveScale));
      gl.uniform1f(u.uWaveRatio,   Math.max(0.01, opts.waveRatio));
      gl.uniform1f(u.uSwell,       opts.swell);
      gl.uniform1f(u.uTurbulence,  opts.turbulence);
      gl.uniform1f(u.uHeight,      opts.height);
      gl.uniform1f(u.uTilt,        tiltRad);
      gl.uniform1f(u.uZoom,        Math.max(0.05, opts.zoom));
      gl.uniform2f(u.uLook,        state.look[0], state.look[1]);
      gl.uniform1f(u.uFogDepth,    Math.max(0.5, opts.fogDepth));
      gl.uniform1f(u.uBrightness,  Math.max(0, opts.brightness));
      gl.uniform1f(u.uOpacity,     clampV(opts.opacity, 0, 1));
      gl.uniform1f(u.uGrain,       Math.max(0, opts.grain));
      gl.uniform3fv(u.uHorizon,    horizon);
      gl.uniform3fv(u.uWave,       wave);
      gl.uniform3fv(u.uCrest,      crest);
      gl.uniform3f(u.uBackground,  ...(paper || [0,0,0]));
      gl.uniform1f(u.uOpaque,      paper ? 1 : 0);
      gl.uniform1f(u.uLight,       opts.lightMode ? 1 : 0);

      const elev  = 0.52;
      const angle = lightRad + state.steer[0] * opts.mouseStrength * 2;
      const alt   = elev - state.steer[1] * opts.mouseStrength * 0.7;
      gl.uniform3f(u.uSun,
        Math.cos(alt) * Math.cos(angle),
        Math.cos(alt) * Math.sin(angle),
        Math.sin(alt)
      );
      gl.uniform1f(u.uRelief, clampV(opts.relief, 0, 1));
      gl.uniform1f(u.uSheen,  Math.max(0, opts.sheen));
      gl.uniform1f(u.uSteps,  QUALITY[opts.quality] || QUALITY.medium);

      const slope = opts.amplitude * (
        (opts.waveScale / 7) * (1 + Math.abs(opts.swell) / 20) +
        ((opts.waveScale * opts.waveRatio) / 3) * (1 + Math.abs(opts.turbulence) / 23)
      );

      const prog    = introProgress();
      const shown   = Math.min(1, prog / 0.22);
      const crestF  = 160 * Math.pow(3/160, easeInOut(Math.max(0, (prog - 0.1) / 0.9)));
      const settle  = clampV((prog - 0.75) / 0.25, 0, 1);
      gl.uniform3f(u.uIntro,
        shown*shown*(3 - 2*shown),
        crestF,
        1 - settle*settle*(3 - 2*settle)
      );

      swellData.fill(0);
      let swellPeak = 0;
      state.swells.forEach((sw, idx) => {
        const age  = state.clock - sw.at;
        const life = age / SWELL_SECONDS;
        const env  = (1 - Math.exp(-age / 0.25)) * Math.pow(1 - life, 1.6);
        const lift = opts.amplitude * SWELL_GAIN * env;
        swellData.set([sw.x - age * 12, sw.y, lift], idx * 3);
        swellPeak = Math.max(swellPeak, lift);
      });
      gl.uniform3fv(u.uSwells,    swellData);
      gl.uniform1f(u.uSwellWidth, SWELL_WIDTH);
      gl.uniform1f(u.uStride,     0.9 / Math.max(1, (slope + (swellPeak * 0.86) / SWELL_WIDTH) / 1.5));

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function tick(now) {
      state.raf = 0;
      if (!state.visible || document.hidden) return;
      const dt = state.last ? Math.min((now - state.last) / 1000, 0.1) : 0;
      state.last = now;
      const reduced = prefersReduced();

      state.clock += dt;
      if (state.introAt < 0) state.introAt = state.clock;
      if (!opts.paused && !reduced) state.time += dt * opts.speed;

      const steering = opts.mouseInteraction && state.inside && !reduced;
      const target   = steering ? state.pointer : [0.5, 0.5];
      const e1 = 1 - Math.exp(-dt / 0.45);
      const goalX = (target[0] - 0.5) * opts.parallaxStrength * 0.35;
      const goalY = (target[1] - 0.5) * opts.parallaxStrength * 0.18;
      state.look[0] += (goalX - state.look[0]) * e1;
      state.look[1] += (goalY - state.look[1]) * e1;

      const e2 = 1 - Math.exp(-dt / 0.6);
      const sx = steering ? state.pointer[0] - 0.5 : 0;
      const sy = steering ? 0.5 - state.pointer[1] : 0;
      state.steer[0] += (sx - state.steer[0]) * e2;
      state.steer[1] += (sy - state.steer[1]) * e2;

      state.swells = state.swells.filter(sw => state.clock - sw.at < SWELL_SECONDS);

      const still     = opts.paused || reduced;
      const transient = state.swells.length > 0 || introProgress() < 1 ||
        Math.abs(goalX - state.look[0]) + Math.abs(goalY - state.look[1]) > 0.0002 ||
        Math.abs(sx - state.steer[0]) + Math.abs(sy - state.steer[1]) > 0.0005;

      if (state.seen !== opts || transient || !still) state.quiet = 0;
      else state.quiet++;
      state.seen = opts;
      if (state.quiet > 3) return;

      state.raf = requestAnimationFrame(tick);
      fit();
      render();
    }

    function wake() {
      if (state.raf || !state.visible || document.hidden) return;
      state.last = 0;
      state.raf = requestAnimationFrame(tick);
    }

    /* Local pointer coords */
    function localPt(ev) {
      const rect = container.getBoundingClientRect();
      return {
        x: (ev.clientX - rect.left) / Math.max(rect.width, 1),
        y: (ev.clientY - rect.top)  / Math.max(rect.height, 1),
        inside:
          ev.clientX >= rect.left && ev.clientX <= rect.right &&
          ev.clientY >= rect.top  && ev.clientY <= rect.bottom,
      };
    }

    const onMove = ev => {
      const pt = localPt(ev);
      const was = state.inside;
      state.inside = pt.inside;
      if (pt.inside) state.pointer = [pt.x, pt.y];
      if ((pt.inside || was) && opts.mouseInteraction) wake();
    };

    const onLeave = () => { state.inside = false; wake(); };

    const onDown = ev => {
      if (!opts.swellOnClick || ev.button !== 0 || prefersReduced()) return;
      if (ev.target && ev.target.closest && ev.target.closest('a,button,input,textarea,select,label,[role=button]')) return;
      const pt = localPt(ev);
      if (!pt.inside) return;
      // Simple ground approximation: map screen click to wave coords
      const gx = (pt.x - 0.5) * 60;
      const gy = (pt.y - 0.5) * 40;
      state.swells.push({ x: gx, y: gy, at: state.clock });
      if (state.swells.length > MAX_SWELLS) state.swells.shift();
      wake();
    };

    const visObs = new IntersectionObserver(entries => {
      state.visible = entries.some(e => e.isIntersecting);
      wake();
    });
    visObs.observe(container);

    const resObs = new ResizeObserver(measure);
    resObs.observe(container);
    measure();

    const onVis = () => { if (!document.hidden) wake(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    document.documentElement.addEventListener('pointerleave', onLeave);

    state.raf = requestAnimationFrame(tick);

    /* Public destroy */
    return {
      destroy() {
        cancelAnimationFrame(state.raf);
        visObs.disconnect();
        resObs.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        gl.deleteProgram(program);
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
        try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch(e) {}
        canvas.remove();
      },
    };
  }

  /* Expose globally */
  global.createGradientWaves = createGradientWaves;

})(window);
