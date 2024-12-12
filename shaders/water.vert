#version 330 core

/*default camera matrices. do not modify.*/
layout(std140) uniform camera {
    mat4 projection;	/*camera's projection matrix*/
    mat4 view;			/*camera's view matrix*/
    mat4 pvm;			/*camera's projection*view*model matrix*/
    mat4 ortho;			/*camera's ortho projection matrix*/
    vec4 position;		/*camera's position in world space*/
};

uniform mat4 model;		/*model matrix*/

/*input variables*/
layout(location = 0) in vec4 pos;			/*vertex position*/
layout(location = 1) in vec4 v_color;		/*vertex color*/
layout(location = 2) in vec4 normal;		/*vertex normal*/
layout(location = 3) in vec4 uv; 			/*vertex uv*/
layout(location = 4) in vec4 tangent;	    /*vertex tangent*/

/*output variables*/
out vec4 vtx_color;
out vec3 vtx_normal; // world space normal
out vec3 vtx_position; // world space position
out vec3 vtx_model_position; // model space position
out vec2 vtx_uv;
out vec3 vtx_tangent;

vec2 hash2(vec2 v)
{
    vec2 rand = vec2(0, 0);

	// Your implementation starts here

	// example hash function
    rand = 50.0 * 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
    rand = -1.0 + 2 * 1.05 * fract(rand.x * rand.y * (rand.x + rand.y) * rand);

	// Your implementation ends here

    return rand;
}

float perlin_noise(vec2 v)
{
	// Your implementation starts here

    float noise = 0;
    vec2 i = floor(v);
    vec2 f = fract(v);
    vec2 m = f * f * (3.0 - 2.0 * f);

    noise = mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), m.x), mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), m.x), m.y);
	// Your implementation ends here
    return noise;
}

float noiseOctave(vec2 v, int num)
{
    float sum = 0;
	// Your implementation starts here
    for(int i = 0; i < num; i++)
    {
        sum += pow(2, -1 * i) * perlin_noise(pow(2, i) * v);
    }
	// Your implementation ends here
    return sum;
}

float height(vec2 v)
{
    float h = 0;
	// Your implementation starts here
    h = 0.75 * noiseOctave(v, 10);
    if(h < 0)
        h *= .5;
	// Your implementation ends here
    return h * 2.;
}

void main() {
    vec4 worldPos = model * vec4(pos.xyz, 1.);
    // ! do not support non-uniform scale
    vec4 worldNormal = model * vec4(normal.xyz, 0.);
    vec4 worldTangent = model * vec4(tangent.xyz, 0.);

    vtx_normal = normalize(worldNormal.xyz);
    vtx_model_position = pos.xyz;
    vtx_position = worldPos.xyz;
    vtx_color = vec4(v_color.rgb, 1.);
    vtx_uv = uv.xy;
    vtx_tangent = worldTangent.xyz;
    

    gl_Position = pvm * worldPos;
    // vtx_pos = pos.xyz;
    // vtx_pos.z = height(pos.xy);

    // gl_Position = pvm * model * vec4(vtx_pos, 1.);
}
