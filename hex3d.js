define(['libs/three.min.js'], function (THREE) {


    // stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){function h(a){c.appendChild(a.dom);return a}function k(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();k(++l%c.children.length)},!1);var g=(performance||Date).now(),e=g,a=0,r=h(new Stats.Panel("FPS","#0ff","#002")),f=h(new Stats.Panel("MS","#0f0","#020"));
if(self.performance&&self.performance.memory)var t=h(new Stats.Panel("MB","#f08","#201"));k(0);return{REVISION:16,dom:c,addPanel:h,showPanel:k,begin:function(){g=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();f.update(c-g,100);if(c>e+1E3&&(r.update(1E3*a/(c-e),100),e=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){g=this.end()},domElement:c,setMode:k}};
Stats.Panel=function(h,k,l){var c=Infinity,g=0,e=Math.round,a=e(window.devicePixelRatio||1),r=80*a,f=48*a,t=3*a,u=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=f;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,f);b.fillStyle=k;b.fillText(h,t,u);b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(f,
v){c=Math.min(c,f);g=Math.max(g,f);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=k;b.fillText(e(f)+" "+h+" ("+e(c)+"-"+e(g)+")",t,u);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,e((1-f/v)*p))}}};"object"===typeof module&&(module.exports=Stats);
    
			var renderer, scene, camera, stats;
			var pointclouds;
			var raycaster;
			var mouse = new THREE.Vector2();
			var intersection = null;
			var spheres = [];
			var spheresIndex = 0;
			var clock;

			var threshold = 0.1;
			var pointSize = 0.3;
			var width = 50;
			var length = 80;
			var cameraRotation = new THREE.Matrix4().makeRotationY( 0.005 ).makeRotationX(0.001);
            var counter = 0;
            var incr = 0.10;

            var numRings = 20;

			init();
            render();
            setTimeout(function() {
                animate();
            }, 1000);

    
			function init() {

				var container = document.getElementById( 'main' );

				scene = new THREE.Scene();

                cubes = [];

				clock = new THREE.Clock();

                var camwidth = container.clientWidth/100;
                var camheight = container.clientHeight/100;
				camera = new THREE.OrthographicCamera( camwidth / - 2, camwidth / 2, camheight / 2, camheight / - 2, 1, 100 );
                //camera = new THREE.PerspectiveCamera( 45, camwidth / camheight, 1, 1000 );
				camera.position.set( 0, 0, 10 );
				camera.lookAt( scene.position );
				camera.updateMatrix();




                renderer = new THREE.WebGLRenderer( { antialias: true } );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight );
                container.appendChild( renderer.domElement );

                const color = 0x333333;
                const near = 10.0;
                const far = 10.4;
                scene.fog = new THREE.Fog(color, near, far);

				//

				stats = new Stats();
				container.appendChild( stats.dom );
                
                var pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
                pointLight.position.set( 0, 0, 4 );
//                scene.add( pointLight );

                var ambientLight = new THREE.AmbientLight( 0xffffff );
scene.add(ambientLight);
                
                var num_cubes = 6;
                for(var i=0; i<num_cubes; i++) {
                    for(var j=0; j<num_cubes; j++) {
                        var geometry = new THREE.OctahedronGeometry( 0.5, 0);
                        var material = new THREE.MeshLambertMaterial( { 
                            wireframe: true, 
                            wireframeLinewidth: 5, 
                            color: 0xffffff,
                            transparent:false,
                            opacity: 1,
                            side: THREE.FrontSide,
                        } );
                        var cube = new THREE.Mesh( geometry, material );
                        cube.position.x = j - (num_cubes-1)/2;
                        cube.position.y = i - (num_cubes-1)/2;
                        scene.add( cube );
                        cubes.push(cube);
                    }


                    // wireframe
                    /*
                    var geo = new THREE.EdgesGeometry( cube.geometry );
                    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 10, opacity: 1 } );
                    var wireframe = new THREE.LineSegments( geo, mat );
                    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
                    cube.add( wireframe );
                    */
                }

			}

			function onDocumentMouseMove( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			var toggle = 0;

            function get_rotation_period(counter) {
                return Math.abs(Math.pow(Math.sin(counter/100), 2))
            }

			function render() {

                var camera_rotation = new THREE.Matrix4().makeRotationY(0.1 );//.makeRotationX(0.08).makeRotationZ(0.02);

                for(var i=0; i<cubes.length; i++) {
                    //cubes[i].rotation.x = Math.pow(Math.sin(counter/100), 2);
                    var val1 = Math.abs(Math.max(0, Math.sin(-i/12 - counter/50)));
                    cubes[i].rotation.y += Math.PI * val1 / 100;
                    cubes[i].rotation.z += Math.PI * val1 / 100;
                    cubes[i].rotation.x += Math.PI * val1 / 100;
 //                   cubes[i].rotation.x = Math.sin(-i/10 + counter/50);
                    //cubes[i].rotation.z = Math.sin(counter/200) * 3*Math.pow(Math.sin(-Math.PI*i/cubes.length + counter/200), 3)/2;
                    //cubes[i].position.z = 4*Math.pow(Math.sin(-Math.PI*i/cubes.length + counter/100), 3);
                    //
                    cubes[i].material.color.setRGB(0.8,1,0.5+val1);
                }
                
                counter += 1;
				camera.updateMatrixWorld();
				renderer.render( scene, camera );

			}
});

