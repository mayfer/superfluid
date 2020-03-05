define([], function () {
    // Particle3D class

    Particle3D = function (material ) {

        THREE.Particle.call( this, material );
        
    //	this.material = material instanceof Array ? material : [ material ];
        
        // define properties
        this.velocity = new THREE.Vector3(0,0,0);
        this.force = new THREE.Vector3(0,0,0); 
        
        this.drag = 1; 
        // methods... 
        
    };

    Particle3D.prototype = new THREE.Particle();
    Particle3D.prototype.constructor = Particle3D;

    Particle3D.prototype.update = function() {
        this.velocity.addSelf(this.force); 
        this.velocity.multiplyScalar(this.drag); 

        this.position.addSelf(this.velocity);
        this.force.set(0,0,0); 

    }

    var TO_RADIANS = Math.PI/180; 

    THREE.Vector3.prototype.rotateY = function(angle){
                        
        cosRY = Math.cos(angle * TO_RADIANS);
        sinRY = Math.sin(angle * TO_RADIANS);
        
        var tempz = this.z;; 
        var tempx = this.x; 

        this.x= (tempx*cosRY)+(tempz*sinRY);
        this.z= (tempx*-sinRY)+(tempz*cosRY);


    }

    THREE.Vector3.prototype.rotateX = function(angle){
                        
        cosRY = Math.cos(angle * TO_RADIANS);
        sinRY = Math.sin(angle * TO_RADIANS);
        
        var tempz = this.z;; 
        var tempy = this.y; 

        this.y= (tempy*cosRY)+(tempz*sinRY);
        this.z= (tempy*-sinRY)+(tempz*cosRY);


    }

    THREE.Vector3.prototype.rotateZ = function(angle){
                        
        cosRY = Math.cos(angle * TO_RADIANS);
        sinRY = Math.sin(angle * TO_RADIANS);
        
        var tempx = this.x;; 
        var tempy = this.y; 

        this.y= (tempy*cosRY)+(tempx*sinRY);
        this.x= (tempy*-sinRY)+(tempx*cosRY);


    }



    // returns a random number between the two limits provided 
    function randomRange(min, max)
    {
        return ((Math.random()*(max-min)) + min); 
    }


    return function(elem, options) {
        var container, stats;
        var camera, scene, renderer, particle;
        var mouseX = 0, mouseY = 0;
        var particles = [],
            MAX_PARTICLES = 200;
         

        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;

    

        function addPart(){
            makeParticle(1); 
            if(particles.length<MAX_PARTICLES)
                setTimeout(addPart, 50); 

        }


        init();
        setInterval( loop, 1000 / 60 );

        function init() {

            container = document.createElement('div');
            document.body.appendChild(container);

            camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 3000 );
            camera.position.z = 500;

            scene = new THREE.Scene();

            

            renderer = new THREE.CanvasRenderer();
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild( stats.domElement );

            document.addEventListener( 'mousemove', onDocumentMouseMove, false );
            document.addEventListener( 'mousedown', onDocumentMouseDown, false );
            document.addEventListener( 'touchstart', onDocumentTouchStart, false );
            document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    
            addPart();
        }

        //

        function onDocumentMouseMove( event ) {

            mouseX = event.clientX - windowHalfX;
            mouseY = event.clientY - windowHalfY;
        }
        function onDocumentMouseDown( event ) {

            makeParticle(); 
        }
        function onDocumentTouchStart( event ) {

            if ( event.touches.length == 1 ) {

                event.preventDefault();

                mouseX = event.touches[ 0 ].pageX - windowHalfX;
                mouseY = event.touches[ 0 ].pageY - windowHalfY;
            }
        }

        function onDocumentTouchMove( event ) {

            if ( event.touches.length == 1 ) {

                event.preventDefault();

                mouseX = event.touches[ 0 ].pageX - windowHalfX;
                mouseY = event.touches[ 0 ].pageY - windowHalfY;
            }
        }

        //

        function loop() {


            var repelforce = new THREE.Vector3(0,0,0),
                mag, 
                repelstrength; 

            for (i=0; i<particles.length; i++){
                var p1 = particles[i]; 

                repelforce.copy(p1.position);
                
                mag = repelforce.length(); 
                repelstrength = (mag - 100) *-1; 

                if(mag>0){
                    repelforce.multiplyScalar(repelstrength/mag);
                    p1.position.addSelf(repelforce); 
                }
                                
                if(i>=particles.length-1) continue; 
                
                for(j=i+1; j<particles.length; j++) {
                    var p2 = particles[j];

                    repelforce.copy(p2.position); 
                    repelforce.subSelf(p1.position); 
                    mag = repelforce.length(); 
                    repelstrength = 50-mag; 

                    if((repelstrength>0)&&(mag>0))	{

                        repelforce.multiplyScalar(repelstrength*0.0035 / mag); 

                        p1.force.subSelf(repelforce); 
                        p2.force.addSelf(repelforce); 

                    }
                }


            }


            // iteratate through each particle
            for (i=0; i<particles.length; i++){
                var particle = particles[i]; 

                particle.update();

            
            }



            camera.position.x += ( mouseX - camera.position.x ) * 0.05;
            camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

            renderer.render( scene, camera );

            stats.update();
        }
        
        
        function makeParticle(){
            
            var color = 0xd0 + Math.random()*0x20; 
            color = color | color<<8 | color<<16; 
            particle = new Particle3D( new THREE.ParticleBasicMaterial( { map: new THREE.Texture( generateSprite() ), blending: THREE.AdditiveBlending } ));
    
            particle.scale.x = particle.scale.y = 2;
            scene.addObject( particle );
        
            particle.position.set(0,1,100); 
            particle.velocity.set(1,0,0);
            particle.velocity.rotateZ(Math.random()*90);			
            particle.velocity.rotateY(Math.random()*360);
            
            particle.position.rotateZ(Math.random()*360); 
        
            particle.drag = 0.96;
    
        
            particles.push(particle); 
            
            
        }
        
        function generateSprite() {

            var canvas = document.createElement( 'canvas' );
            canvas.width = 16;
            canvas.height = 16;
            canvas.loaded = true;

            var context = canvas.getContext( '2d' );
            var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
            gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
            gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
            gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
            gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

            context.fillStyle = gradient;
            context.fillRect( 0, 0, canvas.width, canvas.height );

            return canvas;

        }

        
    };
});
