#version 330 core

uniform vec2 iResolution;
uniform float iTime;
uniform int iFrame;

uniform sampler2D tex_buzz; 

in vec3 vtx_pos; // [-1, 1]
in vec2 vtx_uv; // [0, 1]

out vec4 frag_color;

#define NUM_STAR 100.

// Utility function for random 2D vector generation
vec2 hash2d(float t) {
    t += 1.;
    float x = fract(sin(t * 674.3) * 453.2);
    float y = fract(sin((t + x) * 714.3) * 263.2);
    return vec2(x, y);
}

// Starfield rendering function
vec3 renderParticle(vec2 uv, vec2 pos, float brightness, vec3 color) {
    float d = length(uv - pos);
    return brightness / d * color;
}

vec3 renderStars(vec2 uv) {
    vec3 fragColor = vec3(0.0);
    float t = iTime;
    for (float i = 0.; i < NUM_STAR; i++) {
        vec2 pos = hash2d(i) * 2. - 1.; // map to [-1, 1]
        float brightness = .0015;
        brightness *= sin(1.5 * t + i) * .5 + .5; // flicker
        vec3 color = vec3(0.15, 0.71, 0.92);
        fragColor += renderParticle(uv, pos, brightness, color);
    }
    return fragColor;
}

// Sun rendering function
vec3 renderSun(vec2 fragPos, vec2 sunCenter, float radius, vec3 color) {
    float dist = length(fragPos - sunCenter);
    float edgeFalloff = 15.0; // Trying to make the edge sharper so it doesnt just look like big blob
    vec3 sunColor = color / (dist / radius + 1.0); // I tried to make the texture smoother
    return sunColor;
}

// Shooting star rendering functions
vec2 moveParticle(vec2 initialPos, vec2 velocity, float time) {
    return initialPos + velocity * time;
}

vec3 renderShootingStar(vec2 fragPos, vec2 launchPos, vec2 launchVel, float t, vec3 color) {
    vec3 fragColor = vec3(0.0);
    vec2 emitPos = moveParticle(launchPos, launchVel, t);
    float brightness = 0.05 / (length(fragPos - emitPos) + 0.1); // Star head brightness
    fragColor += color * brightness;
    return fragColor;
}

void main() {
    vec3 fragColor = vec3(0.0);

    // 1. Render starfield background
    vec3 starfield = renderStars(vtx_pos.xy);

    // 2. Render sun
    float sunTime = mod(iTime, 15.0);
    vec2 sunStart = vec2(-1.2, 0.5);
    vec2 sunEnd = vec2(1.2, 0.5);
    vec2 sunPos = mix(sunStart, sunEnd, sunTime / 15.0);
    float sunRadius = 0.2;
    vec3 sunColor = vec3(1.5, 0.8, 0.2);
    vec3 sun = renderSun(vtx_pos.xy, sunPos, sunRadius, sunColor);

    // 3. Render shooting stars
    float cycleTime = 10.0;
    float currentCycle = mod(iTime, cycleTime);
    float starSeed = floor(iTime / cycleTime);
    vec3 shootingStar = vec3(0.0);
    if (currentCycle < 9.0) {
        float startX = hash2d(starSeed).x * 2.0 - 1.0;
        vec2 launchPos = vec2(startX, 1.2);
        vec2 launchVel = vec2(0.5, -1.0);
        shootingStar = renderShootingStar(vtx_pos.xy, launchPos, launchVel, currentCycle, vec3(1.0));
    }

    // 4. Combine effects
    fragColor = starfield + sun + shootingStar;

    frag_color = vec4(fragColor, 1.0);
}
