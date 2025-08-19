class Princess3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.princess = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.animations = {};
    this.currentAnimation = null;

    this.init();
    this.createPrincess();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 5, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 3, 0);

    // Lighting
    this.setupLighting();

    // Ground
    this.createGround();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point light for princess
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(0, 8, 0);
    this.scene.add(pointLight);
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x90ee90,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add some decorative elements
    this.addDecorations();
  }

  addDecorations() {
    // Add some floating hearts
    for (let i = 0; i < 10; i++) {
      const heartGeometry = new THREE.SphereGeometry(0.2, 8, 6);
      const heartMaterial = new THREE.MeshPhongMaterial({
        color: 0xff69b4,
        transparent: true,
        opacity: 0.7,
      });
      const heart = new THREE.Mesh(heartGeometry, heartMaterial);

      heart.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 30,
      );

      // Floating animation
      heart.userData = {
        originalY: heart.position.y,
        speed: Math.random() * 0.02 + 0.01,
      };

      this.scene.add(heart);
    }
  }

  createPrincess() {
    // Create a simple princess character using basic geometries
    const group = new THREE.Group();

    // Body (dress)
    const bodyGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff1493 }); // Deep pink
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac }); // Skin color
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 4;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.9, 16, 16);
    const hairMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 }); // Golden
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 4.3;
    hair.scale.set(1, 0.8, 1);
    hair.castShadow = true;
    group.add(hair);

    // Crown
    const crownGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 4.8;
    crown.castShadow = true;
    group.add(crown);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 4.1, 0.7);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 4.1, 0.7);
    group.add(rightEye);

    // Arms (improved with hands)
    const armGeometry = new THREE.CylinderGeometry(0.18, 0.18, 1.5);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.2, 2.5, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.2, 2.5, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Hands
    const handGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const leftHand = new THREE.Mesh(handGeometry, armMaterial);
    leftHand.position.set(-1.6, 1.7, 0);
    leftHand.castShadow = true;
    group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, armMaterial);
    rightHand.position.set(1.6, 1.7, 0);
    rightHand.castShadow = true;
    group.add(rightHand);

    // Legs (visible under dress)
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.4, 0.4, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.4, 0.4, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Feet (princess shoes)
    const shoeGeometry = new THREE.BoxGeometry(0.3, 0.12, 0.5);
    const shoeMaterial = new THREE.MeshPhongMaterial({ color: 0xd2691e }); // Brown shoes

    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.4, -0.25, 0.1);
    leftShoe.castShadow = true;
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.4, -0.25, 0.1);
    rightShoe.castShadow = true;
    group.add(rightShoe);

    // Dress decoration (belt)
    const beltGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.15);
    const beltMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 }); // Gold belt
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    belt.position.y = 2.8;
    belt.castShadow = true;
    group.add(belt);

    // Crown jewels
    for (let i = 0; i < 6; i++) {
      const jewelGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const jewelColors = [0xff0080, 0x00ff80, 0x8000ff, 0xff8000];
      const jewelColor = jewelColors[i % jewelColors.length];
      const jewelMaterial = new THREE.MeshBasicMaterial({ color: jewelColor });
      const jewel = new THREE.Mesh(jewelGeometry, jewelMaterial);

      const angle = (i / 6) * Math.PI * 2;
      jewel.position.set(Math.cos(angle) * 0.7, 4.9, Math.sin(angle) * 0.7);
      group.add(jewel);
    }

    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const nose = new THREE.Mesh(noseGeometry, headMaterial);
    nose.position.set(0, 3.95, 0.75);
    group.add(nose);

    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0xff69b4 }); // Pink lips
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 3.75, 0.7);
    mouth.scale.set(1.5, 0.5, 0.8);
    group.add(mouth);

    // Store references for animations
    this.princess = group;
    this.princessParts = {
      body,
      head,
      hair,
      crown,
      leftArm,
      rightArm,
      leftHand,
      rightHand,
      leftLeg,
      rightLeg,
      leftEye,
      rightEye,
      belt,
      nose,
      mouth,
    };

    this.scene.add(group);

    // Initialize animation mixer (even though we're using custom animations)
    this.mixer = new THREE.AnimationMixer(group);

    console.log('👸 Beautiful Princess with full body created successfully!');
  }

  playAction(actionName) {
    console.log(`🎬 Playing action: ${actionName}`);

    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }

    const action = actionName.toLowerCase();

    // Map actions to animations with pattern matching
    if (this.matchesPattern(action, ['nhảy múa', 'dance', 'múa', 'khiêu vũ'])) {
      this.currentAnimation = this.danceAnimation();
    } else if (
      this.matchesPattern(action, ['vẫy tay', 'wave', 'chào', 'hello'])
    ) {
      this.currentAnimation = this.waveAnimation();
    } else if (
      this.matchesPattern(action, ['cúi chào', 'bow', 'cúi', 'chào hỏi'])
    ) {
      this.currentAnimation = this.bowAnimation();
    } else if (
      this.matchesPattern(action, ['quay tròn', 'spin', 'quay', 'xoay', 'lăn'])
    ) {
      this.currentAnimation = this.spinAnimation();
    } else if (
      this.matchesPattern(action, ['nhảy lên', 'jump', 'nhảy', 'bay', 'fly'])
    ) {
      this.currentAnimation = this.jumpAnimation();
    } else if (
      this.matchesPattern(action, [
        'nằm',
        'lie',
        'nằm xuống',
        'thư giãn',
        'relax',
        'nghỉ',
      ])
    ) {
      this.currentAnimation = this.lieDownAnimation();
    } else if (this.matchesPattern(action, ['ngủ', 'sleep'])) {
      this.currentAnimation = this.sleepAnimation();
    } else if (this.matchesPattern(action, ['đứng', 'stand', 'idle'])) {
      this.currentAnimation = this.defaultAnimation();
    } else if (this.matchesPattern(action, ['ngồi', 'sit', 'ngồi xuống'])) {
      this.currentAnimation = this.sitAnimation();
    } else if (
      this.matchesPattern(action, ['chạy', 'run', 'nhanh', 'vội vã'])
    ) {
      this.currentAnimation = this.runAnimation();
    } else if (this.matchesPattern(action, ['cười', 'laugh', 'vui', 'happy'])) {
      this.currentAnimation = this.laughAnimation();
    } else if (
      this.matchesPattern(action, ['giận', 'angry', 'mad', 'bực tức'])
    ) {
      this.currentAnimation = this.angryAnimation();
    } else if (
      this.matchesPattern(action, ['lén lút', 'sneak', 'ninja', 'nhanh nhẹn'])
    ) {
      this.currentAnimation = this.sneakAnimation();
    } else if (
      this.matchesPattern(action, ['võ thuật', 'martial', 'karate', 'đánh võ'])
    ) {
      this.currentAnimation = this.martialArtsAnimation();
    } else if (
      this.matchesPattern(action, ['điên cuồng', 'crazy', 'wild', 'cuồng'])
    ) {
      this.currentAnimation = this.wildAnimation();
    } else if (this.matchesPattern(action, ['vỗ tay', 'clap', 'applaud'])) {
      this.currentAnimation = this.clapAnimation();
    } else {
      // For unknown actions, try to create a dynamic animation
      this.currentAnimation = this.createDynamicAnimation(action);
    }
  }

  // Helper method to match action patterns
  matchesPattern(action, patterns) {
    return patterns.some(
      pattern =>
        action.includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(action),
    );
  }

  danceAnimation() {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      const angle = progress * Math.PI * 4; // 2 full rotations

      if (this.princess) {
        // Body sway
        this.princess.rotation.y = Math.sin(angle) * 0.3;
        this.princess.position.y = Math.abs(Math.sin(angle * 2)) * 0.5;

        // Arms movement
        if (this.princessParts.leftArm) {
          this.princessParts.leftArm.rotation.z =
            Math.PI / 6 + Math.sin(angle) * 0.5;
        }
        if (this.princessParts.rightArm) {
          this.princessParts.rightArm.rotation.z =
            -Math.PI / 6 + Math.cos(angle) * 0.5;
        }

        // Hands movement
        if (this.princessParts.leftHand) {
          this.princessParts.leftHand.position.x = -1.6 + Math.sin(angle) * 0.3;
          this.princessParts.leftHand.position.y = 1.7 + Math.cos(angle) * 0.2;
        }
        if (this.princessParts.rightHand) {
          this.princessParts.rightHand.position.x = 1.6 + Math.cos(angle) * 0.3;
          this.princessParts.rightHand.position.y = 1.7 + Math.sin(angle) * 0.2;
        }

        // Legs slight movement
        if (this.princessParts.leftLeg && this.princessParts.rightLeg) {
          this.princessParts.leftLeg.rotation.x = Math.sin(angle) * 0.1;
          this.princessParts.rightLeg.rotation.x = -Math.sin(angle) * 0.1;
        }
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  waveAnimation() {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % 500) / 500; // Wave every 0.5 seconds
      const angle = progress * Math.PI * 2;

      if (this.princessParts.rightArm) {
        this.princessParts.rightArm.rotation.z =
          -Math.PI / 3 + Math.sin(angle) * 0.3;
        this.princessParts.rightArm.rotation.x = Math.sin(angle) * 0.2;
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  bowAnimation() {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const bowAngle = Math.sin(progress * Math.PI) * 0.5;

      if (this.princess) {
        this.princess.rotation.x = bowAngle;
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  spinAnimation() {
    const duration = 3000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (this.princess) {
        this.princess.rotation.y = progress * Math.PI * 4; // 2 full rotations
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  jumpAnimation() {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      const jumpHeight = Math.sin(progress * Math.PI) * 3;

      if (this.princess) {
        this.princess.position.y = jumpHeight;
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  defaultAnimation() {
    // Gentle breathing/idle animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const breathe = Math.sin(elapsed * 0.003) * 0.1;

      if (this.princess) {
        this.princess.scale.y = 1 + breathe * 0.05;
      }

      if (elapsed < 3000) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  // Sleep animation: transition to lie pose and breathe
  sleepAnimation() {
    const duration = 3500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (this.princess) {
        const liePhase = Math.min(progress * 2, 1);
        this.princess.rotation.z = liePhase * (Math.PI / 2);
        this.princess.position.y = -liePhase * 1.2;

        if (progress > 0.5) {
          const breathe = Math.sin((elapsed - duration * 0.5) * 0.003) * 0.06;
          this.princess.scale.y = 1 + breathe;
        }
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => this.resetPose(), 1500);
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  resetPose() {
    if (this.princess) {
      this.princess.rotation.set(0, 0, 0);
      this.princess.position.set(0, 0, 0);
      this.princess.scale.set(1, 1, 1);
    }

    if (this.princessParts.leftArm) {
      this.princessParts.leftArm.rotation.set(0, 0, Math.PI / 6);
    }

    if (this.princessParts.rightArm) {
      this.princessParts.rightArm.rotation.set(0, 0, -Math.PI / 6);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Update mixer if exists
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Update controls
    this.controls.update();

    // Animate floating decorations
    this.scene.traverse(child => {
      if (child.userData && child.userData.originalY !== undefined) {
        child.position.y =
          child.userData.originalY +
          Math.sin(Date.now() * child.userData.speed) * 0.5;
        child.rotation.y += 0.01;
      }
    });

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  // New animation methods
  lieDownAnimation() {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (this.princess) {
        // Gradually rotate to lying position
        this.princess.rotation.z = (progress * Math.PI) / 2;
        this.princess.position.y = -progress * 1.5;
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  sitAnimation() {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (this.princess) {
        this.princess.position.y = -progress * 1;
        this.princess.scale.y = 1 - progress * 0.2;
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  runAnimation() {
    const duration = 3000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % 200) / 200;
      const angle = progress * Math.PI * 2;

      if (this.princess) {
        this.princess.position.x = Math.sin(angle * 4) * 2;
        this.princess.position.y = Math.abs(Math.sin(angle * 8)) * 0.3;

        if (this.princessParts.leftArm) {
          this.princessParts.leftArm.rotation.x = Math.sin(angle * 4) * 0.8;
        }
        if (this.princessParts.rightArm) {
          this.princessParts.rightArm.rotation.x = -Math.sin(angle * 4) * 0.8;
        }

        // Running leg movements
        if (this.princessParts.leftLeg) {
          this.princessParts.leftLeg.rotation.x = Math.sin(angle * 4) * 0.6;
        }
        if (this.princessParts.rightLeg) {
          this.princessParts.rightLeg.rotation.x = -Math.sin(angle * 4) * 0.6;
        }
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  laughAnimation() {
    const duration = 2500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % 300) / 300;
      const bounce = Math.abs(Math.sin(progress * Math.PI));

      if (this.princess) {
        this.princess.position.y = bounce * 0.5;
        this.princess.scale.set(
          1 + bounce * 0.1,
          1 + bounce * 0.1,
          1 + bounce * 0.1,
        );
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  sneakAnimation() {
    const duration = 3000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const sneakCycle = (elapsed % 800) / 800;

      if (this.princess) {
        this.princess.position.y = -0.8;
        this.princess.scale.y = 0.7;
        this.princess.position.x = Math.sin(sneakCycle * Math.PI * 2) * 1.5;
        this.princess.rotation.y = Math.sin(sneakCycle * Math.PI) * 0.3;
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  wildAnimation() {
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const wildCycle = (elapsed % 150) / 150;

      if (this.princess) {
        this.princess.position.x = Math.sin(wildCycle * Math.PI * 8) * 2;
        this.princess.position.y =
          Math.abs(Math.sin(wildCycle * Math.PI * 12)) * 1;
        this.princess.rotation.y = Math.sin(wildCycle * Math.PI * 6) * 2;
        this.princess.rotation.z = Math.cos(wildCycle * Math.PI * 4) * 0.5;

        if (this.princessParts.leftArm) {
          this.princessParts.leftArm.rotation.z =
            Math.sin(wildCycle * Math.PI * 10) * Math.PI;
        }
        if (this.princessParts.rightArm) {
          this.princessParts.rightArm.rotation.z =
            Math.cos(wildCycle * Math.PI * 8) * Math.PI;
        }
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  createDynamicAnimation(actionName) {
    console.log(`🎨 Creating dynamic animation for: ${actionName}`);

    const duration = 2500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % 600) / 600;
      const cycle = Math.sin(progress * Math.PI * 2);

      if (this.princess) {
        this.princess.position.y = Math.abs(cycle) * 0.3;
        this.princess.rotation.y = cycle * 0.2;

        if (this.princessParts.leftArm) {
          this.princessParts.leftArm.rotation.z = Math.PI / 6 + cycle * 0.4;
        }
        if (this.princessParts.rightArm) {
          this.princessParts.rightArm.rotation.z = -Math.PI / 6 - cycle * 0.4;
        }
      }

      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        this.resetPose();
      }
    };

    animate();
    return { stop: () => this.resetPose() };
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
