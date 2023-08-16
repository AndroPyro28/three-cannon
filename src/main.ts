
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas') as HTMLCanvasElement
})
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000)
camera.position.set(0,20,-30)

const orbitControl = new OrbitControls(camera, renderer.domElement)
orbitControl.update()

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth,innerHeight)
})

//
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
})


const groundGeo = new THREE.PlaneGeometry(30,30);
const groundMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  wireframe:true
})
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
scene.add(groundMesh) 

const groundPhysMat = new CANNON.Material();

const groundBody = new CANNON.Body({
  // shape:new CANNON.Plane(),
  shape:new CANNON.Box(new CANNON.Vec3(15,15,0.1)),
  // mass: 10,
  type:CANNON.Body.STATIC,
  material:groundPhysMat
})
world.addBody(groundBody)

groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

const boxGeo = new THREE.BoxGeometry(2,2,2);
const boxMat = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe:true
})
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh) 
const boxPhysMat = new CANNON.Material();

const boxBody = new CANNON.Body({
  mass:1,
  shape:new CANNON.Box(new CANNON.Vec3(1,1,1)),
  position: new CANNON.Vec3(1,20,0),
  material:boxPhysMat
})
boxBody.angularVelocity.set(0,10,0);
boxBody.angularDamping = 0.5
world.addBody(boxBody)

const groundBoxContactMat = new CANNON.ContactMaterial(groundPhysMat, boxPhysMat,{friction: 0.04})
world.addContactMaterial(groundBoxContactMat)

const sphereGeo = new THREE.SphereGeometry(2)
const sphereMat = new THREE.MeshBasicMaterial({
  color:0xff0000,
  wireframe: true
})
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

const spherePhysMat = new CANNON.Material();

const groundSphereContactMat = new CANNON.ContactMaterial(groundPhysMat, spherePhysMat, {restitution:0.9})

world.addContactMaterial(groundSphereContactMat)
const sphereBody = new CANNON.Body({
  mass:1,
  shape:new CANNON.Sphere(2),
  position: new CANNON.Vec3(0,15,0),
  material: spherePhysMat
})

sphereBody.linearDamping = 0.31
world.addBody(sphereBody)



const timeStep = 1 / 60;


const animate = () => {
  world.step(timeStep)
  // cannon body have a physics 
  // merging THREE mesh with Cannon body
  // copying groundBody position and quaternion with groundMesh

  //@ts-ignore 
  groundMesh.position.copy(groundBody.position)
  //@ts-ignore
  groundMesh.quaternion.copy(groundBody.quaternion)

  //@ts-ignore
  boxMesh.position.copy(boxBody.position)
  //@ts-ignore
  boxMesh.quaternion.copy(boxBody.quaternion)

  //@ts-ignore
  sphereMesh.position.copy(sphereBody.position)
  //@ts-ignore
  sphereMesh.quaternion.copy(sphereBody.quaternion)

  renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)
