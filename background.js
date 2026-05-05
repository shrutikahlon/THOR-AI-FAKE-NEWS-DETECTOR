// Three.js Liquid Metal Background Animation
class LiquidMetalBackground {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.material = null;
        this.geometry = null;
        this.mesh = null;
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 1;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create plane geometry
        this.geometry = new THREE.PlaneGeometry(2, 2, 512, 512);

        // Vertex shader
        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = vec4(position, 1.0);
            }
        `;

        // Fragment shader with liquid metal effect
        const fragmentShader = `
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec2 u_resolution;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            
            // Noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            // Fractal noise
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 6; i++) {
                    value += amplitude * snoise(p * frequency);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                
                return value;
            }
            
            // Main shader logic
            void main() {
                vec2 uv = vUv;
                vec2 mouse = u_mouse * 0.5;
                
                // Time-based animation
                float time = u_time * 0.3;
                
                // Multiple layers of noise for liquid effect
                vec2 p1 = uv * 2.0 + vec2(time * 0.1, time * 0.05);
                float noise1 = fbm(p1);
                
                vec2 p2 = uv * 3.0 - vec2(time * 0.15, time * 0.1);
                float noise2 = fbm(p2);
                
                vec2 p3 = uv * 5.0 + vec2(time * 0.2, -time * 0.15);
                float noise3 = fbm(p3);
                
                // Mouse interaction
                float mouseDist = distance(uv, mouse);
                float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseDist);
                mouseInfluence *= sin(u_time * 2.0) * 0.5 + 0.5;
                
                // Combine noise layers
                float liquid = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
                liquid += mouseInfluence * 0.3;
                
                // Create metallic surface effect
                vec3 color = vec3(0.0);
                
                // Base black color
                vec3 baseColor = vec3(0.0, 0.0, 0.0);
                
                // Metallic highlights
                float metallic = smoothstep(0.3, 0.7, liquid);
                float highlight = smoothstep(0.6, 0.9, liquid);
                
                // Create gradient for depth
                float depth = smoothstep(0.2, 0.8, uv.y);
                
                // Metallic surface with depth variation
                color = mix(baseColor, vec3(0.06, 0.06, 0.06), metallic);
                color = mix(color, vec3(0.1, 0.1, 0.12), highlight * depth);
                
                // Add subtle reflections
                float reflection = smoothstep(0.7, 0.95, liquid);
                color = mix(color, vec3(0.15, 0.15, 0.18), reflection * 0.5);
                
                // Add edge glow
                float edge = distance(uv, vec2(0.5));
                edge = 1.0 - smoothstep(0.4, 0.5, edge);
                color = mix(color, vec3(0.02, 0.02, 0.03), edge * 0.3);
                
                // Vignette effect
                float vignette = distance(uv, vec2(0.5));
                vignette = 1.0 - smoothstep(0.3, 0.8, vignette);
                color *= vignette;
                
                // Subtle color variation for premium look
                color.r += liquid * 0.01;
                color.b += (1.0 - liquid) * 0.01;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        // Create shader material
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                u_time: { value: 0 },
                u_mouse: { value: new THREE.Vector2(0, 0) },
                u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            side: THREE.DoubleSide
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            if (this.material) {
                this.material.uniforms.u_mouse.value.set(this.mouse.x, this.mouse.y);
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            if (this.material) {
                this.material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
            }
        });

        // Touch events for mobile
        window.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
                
                if (this.material) {
                    this.material.uniforms.u_mouse.value.set(this.mouse.x, this.mouse.y);
                }
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        if (this.material) {
            this.material.uniforms.u_time.value = this.time;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    // Cleanup method
    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.renderer) this.renderer.dispose();
    }
}

// Initialize background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LiquidMetalBackground();
});

// Performance optimization for mobile
if (window.innerWidth <= 768) {
    // Reduce quality for mobile devices
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        canvas.style.opacity = '0.7';
    }
}
