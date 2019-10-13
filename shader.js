
/*
// http://www.pouet.net/prod.php?which=57245
// If you intend to reuse this shader, please add credits to 'Danilo Guanabara'

#define t iTime
#define r iResolution.xy

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	vec3 c;
	float l,z=t;
	for(int i=0;i<3;i++) {
		vec2 uv,p=fragCoord.xy/r;
		uv=p;
		p-=.5;
		p.x*=r.x/r.y;
		z+=.07;
		l=length(p);
		uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.));
		c[i]=.01/length(abs(mod(uv,1.)-.5));
	}
	fragColor=vec4(c/l,t);
}
*/

define(['libs/three.min.js'], function (THREE) {
    var container = document.getElementById('main');

    var fragTest = `
    // http://www.pouet.net/prod.php?which=57245
        uniform float iGlobalTime;
        uniform vec2 iResolution;
        uniform vec4      iMouse;
        uniform sampler2D iChannel0;
        varying vec2 fragCoord;
        varying vec2 vUv;

		#define t iGlobalTime
		#define r iResolution.xy

		void mainImage( out vec4 fragColor, in vec2 fragCoord ){
			vec3 c;
			float l,z=t;
			for(int i=0;i<3;i++) {
				vec2 uv,p=fragCoord.xy/r;
				uv=p;
				p-=.5;
				p.x*=r.x/r.y;
				z+=.07;
				l=length(p);
				uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.));
				c[i]=.01/length(abs(mod(uv,1.)-.5));
			}
			fragColor=vec4(c/l,t);
		}

        void main(){
            mainImage(gl_FragColor, gl_FragCoord.xy );
        }
    `

    var frag1 = `

        uniform float iGlobalTime;
        uniform vec2 iResolution;
        uniform vec4      iMouse;
        uniform sampler2D iChannel0;
        varying vec2 fragCoord;
        varying vec2 vUv;

        vec2 cmul( vec2 a, vec2 b )  { return vec2( a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x ); }
        vec2 csqr( vec2 a )  { return vec2( a.x*a.x - a.y*a.y, 2.*a.x*a.y  ); }
        vec3 dmul( vec3 a, vec3 b )  {
            float r = length(a);
            b.xy=cmul(normalize(a.xy), b.xy);
            b.yz=cmul(normalize(a.yz), b.yz);
            return r*b;
        }
        vec3 pow4( vec3 z){
            z=dmul(z,z);return dmul(z,z);
        }
        vec3 pow3( vec3 z){
            float r2 = dot(z,z);
            vec2 a = z.xy;a=csqr(a)/dot( a,a);
            vec2 b = z.yz;b=csqr(b)/dot( b,b); 
            vec2 c = z.xz;c=csqr(c)/dot( c,c);
            z.xy = cmul(a,z.xy);   
            z.yz = cmul(b,z.yz);      
            z.xz = cmul(c,z.xz);
            return r2*z;
        }
        mat2 rot(float a) {
            return mat2(cos(a),sin(a),-sin(a),cos(a));  
        }
        float zoom=4.;
        float field(in vec3 p) {
            float res = 0.;
            vec3 c = p;
            for (int i = 0; i < 10; ++i) {
                p = abs(p) / dot(p,p) -1.;
                p = dmul(p,p)+.7;
                res += exp(-6. * abs(dot(p,c)-.15));
            }
            return max(0., res/3.);
        }
        vec3 raycast( in vec3 ro, vec3 rd )
        {
            float t = 6.0;
            float dt = .05;
            vec3 col= vec3(0.);
            for( int i=0; i<64; i++ )
            {
                float c = field(ro+t*rd);               
                t+=dt/(.35+c*c);
                c = max(5.0 * c - .9, 0.0);
                col = .97*col+ .08*vec3(0.5*c*c*c, .6*c*c, c);
            }
            return col;
        }
        void main()
        {
            float time = iGlobalTime;
            vec2 q = fragCoord.xy / iResolution.xy;
            vec2 p = -1.0 + 2.0 * q;
            p.x *= iResolution.x/iResolution.y;
            vec2 m = vec2(0.);
            if( iMouse.z>0.0 )m = iMouse.xy/iResolution.xy*3.14;
            m-=.5;
            vec3 ro = zoom*vec3(1.);
            ro.yz*=rot(m.y);
            ro.xz*=rot(m.x+ 0.1*time);
            vec3 ta = vec3( 0.0 , 0.0, 0.0 );
            vec3 ww = normalize( ta - ro );
            vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
            vec3 vv = normalize( cross(uu,ww));
            vec3 rd = normalize( p.x*uu + p.y*vv + 4.0*ww );
            vec3 col = raycast(ro,rd);
            col =  .5 *(log(1.+col));
            col = clamp(col,0.,1.);
            gl_FragColor = vec4( sqrt(col), 1.0 );
        }


    `;

    var frag2 = `
        uniform float iGlobalTime;
        uniform vec2 iResolution;
        uniform vec4      iMouse;
        uniform sampler2D iChannel0;
        varying vec2 fragCoord;
        varying vec2 vUv;
        void main()
        {
            float k=0.;
            vec3 d =  vec3(fragCoord,1.0)/1.0-.5, o = d, c=k*d, p;
            for( int i=0; i<99; i++ ){
                p = o+sin(iGlobalTime*.1);
                for (int j = 0; j < 10; j++) 
                    p = abs(p.zyx-.4) -.7,k += exp(-6. * abs(dot(p,o)));
                k/=3.;
                o += d *.05*k;
                c = .97*c + .1*k*vec3(k*k,k,1);
            }
            c =  .4 *log(1.+c);
            gl_FragColor.rgb = c;
        }
    `;

    var fragGeneral = `
        attribute vec3 in_Position;
        varying vec2 fragCoord;
        varying vec2 vUv; 
        void main()
        {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
            fragCoord = position.xy;
        }
    `;    

    var myInstance = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000),
      gameObjects: [],
      gameObjectsDict: {},
    };
    (function(myInstance) {
      myInstance.camera.position.x = 0;
      myInstance.camera.position.y = 10;
      myInstance.camera.position.z = 5;
      var webgl = new THREE.WebGLRenderer();
      webgl.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(webgl.domElement);

      function onWindowResize() {
        myInstance.camera.aspect = container.clientWidth / container.clientHeight;
        myInstance.camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
      window.addEventListener('resize', onWindowResize, false);
      renderer = webgl
      var light = new THREE.HemisphereLight(0xeeeeee, 0x888888, 1);
      light.position.set(0, 20, 0);
      myInstance.scene.add(light);
      counter = 0;

      function render() {
        myInstance.gameObjects.forEach(function(item) {
          item.update(counter);
        });
        requestAnimationFrame(render);
        renderer.render(myInstance.scene, myInstance.camera);
      }
      render();
    })(myInstance);

    (function() {
      var gameObject = function(name, x, y, z, col, rx, ry) {
        this.name = name
        this.geometry = new THREE.BoxGeometry(25, 15, 0);
        uniforms = {
          iGlobalTime: {
            type: "f",
            value: 1.0
          },
          iResolution: {
            type: "v2",
            value: new THREE.Vector2()
          },
        };
        uniforms.iResolution.value.x = container.clientWidth; // window.innerWidth;
        uniforms.iResolution.value.y = container.clientHeight; // window.innerHeight;
        this.material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: fragGeneral,
          fragmentShader: fragTest,
        });
        this.obj = new THREE.Mesh(this.geometry, this.material);
        this.obj.startTime = Date.now();
        this.obj.uniforms = uniforms;
        this.rx = rx
        this.ry = ry
        this.obj.name = name
        myInstance.scene.add(this.obj);
        this.obj.position.x = x;
        this.obj.position.y = y;
        this.obj.position.z = z;
        this.vel = [0, 0, 0]
      }
      gameObject.prototype.update = function() {
        this.obj.rotation.x += this.rx
        this.obj.rotation.y += this.ry
        this.obj.position.x += this.vel[0]
        this.obj.position.y += this.vel[1]
        this.obj.position.z += this.vel[2]
        var elapsedMilliseconds = Date.now() - this.obj.startTime;
        var elapsedSeconds = elapsedMilliseconds / 1000.;
        this.obj.uniforms.iGlobalTime.value = elapsedSeconds;
      }
      myInstance.gameObjectsDict['cube3'] = myInstance.gameObjects.push(new gameObject("cube3", 0, 10, -3, 0x0000ff, 0, 0.0001))
    })();

});

