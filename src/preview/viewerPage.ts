export function renderViewerPage(modelUrl: string, scadUrl?: string): string {
  const escapedModelUrl = JSON.stringify(modelUrl);
  const escapedScadUrl = scadUrl ? JSON.stringify(scadUrl) : undefined;
  const scadDownloadLink = scadUrl
    ? `<a class="download" href=${escapedScadUrl} download="model.scad">Download SCAD</a>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OpenSCAD 3D Preview</title>
  <style>
    html, body { margin: 0; height: 100%; overflow: hidden; background: #1a1a1a; color: #eee; font-family: system-ui, sans-serif; }
    #app { width: 100%; height: 100%; }
    #status { position: absolute; left: 12px; top: 12px; padding: 8px 12px; background: rgba(0,0,0,.55); border-radius: 6px; font-size: 14px; }
    #status.error { color: #ffb4b4; }
    #downloads {
      position: absolute; right: 12px; top: 12px;
      display: flex; gap: 8px;
    }
    #downloads .download {
      padding: 8px 14px; background: rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.2);
      border-radius: 6px; font-size: 14px; color: #eee; text-decoration: none;
    }
    #downloads .download:hover { background: rgba(255,255,255,.12); }
  </style>
</head>
<body>
  <div id="status">Loading model...</div>
  <div id="downloads">
    ${scadDownloadLink}
    <a class="download" href=${escapedModelUrl} download="model.stl">Download STL</a>
  </div>
  <div id="app"></div>
  <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.174.0/examples/jsm/"
      }
    }
  </script>
  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { STLLoader } from 'three/addons/loaders/STLLoader.js';

    const status = document.getElementById('status');
    const container = document.getElementById('app');
    const modelUrl = ${escapedModelUrl};

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(120, 90, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(1, 1, 1);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-1, 0.5, -1);
    scene.add(fillLight);

    const loader = new STLLoader();
    loader.load(
      modelUrl,
      (geometry) => {
        geometry.computeBoundingBox();
        geometry.center();
        const material = new THREE.MeshStandardMaterial({ color: 0x6eb5ff, metalness: 0.1, roughness: 0.65 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z, 1);
        const distance = maxDim * 2.2;
        camera.position.set(distance, distance * 0.75, distance);
        controls.target.set(0, 0, 0);
        controls.update();
        status.textContent = 'Drag to rotate, scroll to zoom';
      },
      undefined,
      (error) => {
        status.textContent = error instanceof Error ? error.message : 'Failed to load model';
        status.classList.add('error');
      }
    );

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  </script>
</body>
</html>`;
}
