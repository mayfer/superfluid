
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
			float l, z = t;
            float fr = 0.;
			for(int i = 0; i < 3; i++) {
				vec2 uv, p = fragCoord.xy/r;
				uv = p;
				p -= .5;
				l = length(p);
				c[i] = cos(sin(length(p.x) * 10.) * (sin(t/8.) * 20.) * cos(t/8.))
                    * cos(length(p.y) * 10. * sin(t/8.))
                    * 2. + cos(t/4.);
                c[i] += fr;
                fr += sin((p.x / cos(p.x)*sin(p.y + sin(t))) * 10.) / 2.;
			}
			fragColor = vec4(c, 1.);
		}

        void main(){
            mainImage(gl_FragColor, gl_FragCoord.xy );
        }
    
    `

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
        this.geometry = new THREE.BoxGeometry(20, 20, 0);
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
          /*
        this.obj.rotation.x += this.rx*100
        this.obj.rotation.y += this.ry*100
        */
        var elapsedMilliseconds = Date.now() - this.obj.startTime;
        var elapsedSeconds = elapsedMilliseconds / 1000.;
        this.obj.uniforms.iGlobalTime.value = elapsedSeconds;
      }
      myInstance.gameObjectsDict['cube3'] = myInstance.gameObjects.push(new gameObject("cube3", 0, 10, -3, 0x0000ff, 0, 0.0001))
    })();

});

