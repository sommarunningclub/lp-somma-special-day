'use client'

import { useEffect, useRef } from 'react'

export default function ElasticStringsBackground() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const code = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      background-color: #555555;
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100vw;
      height: 100vh;
    }
    canvas { 
      display: block; 
    }
    #recording-indicator {
      display: none; position: absolute; top: 20px; left: 20px; color: white; font-size: 18px; font-weight: bold; align-items: center; gap: 8px; z-index: 100; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lil-gui@0.19"></script>
</head>
<body>
  <div id="recording-indicator">
    <div style="width: 15px; height: 15px; background-color: red; border-radius: 50%;"></div>
    <span id="recording-time">REC: 24.0s</span>
  </div>
  <script>
    // Physics and UI settings
    const settings = {
        elasticity: 0.8, // Spring constant for adjacent points
        bendingResistance: 0.1, // Spring constant for i to i+2 points
        repulsionStrength: 2.0, // Force push when points are close
        repulsionRadius: 60, // Distance within which points repel
        damping: 0.85, // Air resistance / friction
        gravity: 0.0, // Downward force
        lineWidth: 60, // Width of the strings
        restLength: 15, // Default distance between points in a string
        autoMode: true,
        initialVelocity: 15, // Toss speed when spawned
        autoSpawnThreshold: 75, // Clearance required to spawn
        autoSpawnInterval: 100, // Wait time in ms after a successful spawn
        recordVideo: () => {
            if (!isRecording) startRecording();
        },
        reset: () => {
            strings = [];
            initStrings();
        }
    };

    const palette = [
        '#eb4e28', // Orange
        '#1e4b9d', // Blue
        '#f5dec0', // Cream
        '#dfa6e0', // Lilac
        '#8fb6ae', // Mint
        '#8d98c6', // Periwinkle
        '#19242d', // Dark Navy
        '#111617'  // Black/Dark
    ];
    let currentBgColor;
    let currentLineColors = [];

    let strings = [];
    let draggingPoint = null;
    let isRecording = false;
    let recordingStartTime = 0;
    let mediaRecorder;
    let recordedChunks = [];
    let lastSpawnTime = 0;
    let lastRecordingInterval = 0;

    function setup() {
      createCanvas(windowWidth, windowHeight);
        
        // GUI Setup using lil-gui
        window.gui = new lil.GUI({ title: 'Physics Settings' });
        window.gui.add(settings, 'elasticity', 0.01, 2.0).name('Elasticity');
        window.gui.add(settings, 'bendingResistance', 0.0, 1.0).name('Bend Resistance');
        window.gui.add(settings, 'repulsionStrength', 0.0, 10.0).name('Repulsion Force');
        window.gui.add(settings, 'repulsionRadius', 10, 150).name('Repulsion Radius');
        window.gui.add(settings, 'damping', 0.5, 0.99).name('Damping');
        window.gui.add(settings, 'gravity', -2.0, 2.0).name('Gravity');
        window.gui.add(settings, 'lineWidth', 10, 150).name('Line Width');
        window.gui.add(settings, 'autoMode').name('Auto Mode').listen();
        window.gui.add(settings, 'initialVelocity', 0, 50).name('Initial Velocity');
        window.gui.add(settings, 'autoSpawnThreshold', 50, 400).name('Spawn Clearance');
        window.gui.add(settings, 'autoSpawnInterval', 100, 2000).name('Spawn Interval');
        window.gui.add(settings, 'recordVideo').name('Record (24s)');
        window.gui.add(settings, 'reset').name('Reset Scene');
        window.gui.hide(); // Hide by default
        
        initStrings();
    }

    function initStrings() {
        let p = [...palette];
        let bgIndex = floor(random(p.length));
        currentBgColor = color(p[bgIndex]);
        p.splice(bgIndex, 1);
        currentLineColors = p.map(c => color(c));
        
        // Create initial strings at random positions
        for (let i = 0; i < 3; i++) {
            let rx = random(100, width - 100);
            let ry = random(100, height - 100);
            let s = new ElasticString(rx, ry, 35);
            s.color = currentLineColors[floor(random(currentLineColors.length))];
            strings.push(s);
        }
    }

    function draw() {
        background(currentBgColor);
        
        // Gather all points across all strings for repulsion checking
        let allPoints = [];
        for (let s of strings) {
            allPoints = allPoints.concat(s.points);
        }
        
        // 1. Point Repulsion (Inter-string and Intra-string)
        for (let i = 0; i < allPoints.length; i++) {
            for (let j = i + 1; j < allPoints.length; j++) {
                let p1 = allPoints[i];
                let p2 = allPoints[j];
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let dSq = dx*dx + dy*dy;
                
                let rSq = settings.repulsionRadius * settings.repulsionRadius;
                if (dSq > 0 && dSq < rSq) {
                    let d = sqrt(dSq);
                    let force = (settings.repulsionRadius - d) / settings.repulsionRadius * settings.repulsionStrength;
                    let fx = (dx / d) * force;
                    let fy = (dy / d) * force;
                    
                    p1.vx += fx;
                    p1.vy += fy;
                    p2.vx -= fx;
                    p2.vy -= fy;
                }
            }
        }
        
        // 2. String internal forces and updates
        for (let s of strings) {
            s.update();
        }
        
        // Interaction override for dragging
        if (mouseIsPressed && draggingPoint) {
            // Constrain dragging to canvas bounds
            let targetX = constrain(mouseX, 0, width);
            let targetY = constrain(mouseY, 0, height);
            
            draggingPoint.x = targetX;
            draggingPoint.y = targetY;
            draggingPoint.vx = 0;
            draggingPoint.vy = 0;
        }
        
        // Auto Mode Spawning
        if (settings.autoMode && millis() - lastSpawnTime > settings.autoSpawnInterval) {
            let allPts = [];
            for (let s of strings) allPts = allPts.concat(s.points);
            
            for (let tries = 0; tries < 10; tries++) {
                let rx = random(100, width - 100);
                let ry = random(100, height - 100);
                let tooClose = false;
                
                for (let p of allPts) {
                    if (dist(rx, ry, p.x, p.y) < settings.autoSpawnThreshold) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (!tooClose) {
                    let s = new ElasticString(rx, ry, 35);
                    s.color = currentLineColors[floor(random(currentLineColors.length))];
                    strings.push(s);
                    lastSpawnTime = millis();
                    break;
                }
            }
        }
        
        // Render all strings
        for (let s of strings) {
            s.draw();
        }
        
        // Recording UI overlay
        if (isRecording) {
            let elapsed = (millis() - recordingStartTime) / 1000;
            let remaining = 24.0 - elapsed;
            
            // Reset scene and background every 6 seconds while recording
            let currentInterval = Math.floor(elapsed / 6.0);
            // Prevent resetting on the final frame when interval hits 4 (24s / 6s = 4)
            if (currentInterval > lastRecordingInterval && currentInterval < 4) {
                settings.reset();
                lastRecordingInterval = currentInterval;
            }
            
            if (remaining <= 0) {
                stopRecording();
                remaining = 0;
            } else {
                document.getElementById('recording-time').innerText = \`REC: \${remaining.toFixed(1)}s\`;
            }
        }
    }

    function mousePressed() {
        // Find closest point to drag
        let closestDist = 40; // interaction radius
        let closestPt = null;
        
        for (let s of strings) {
            for (let p of s.points) {
                let d = dist(mouseX, mouseY, p.x, p.y);
                if (d < closestDist) {
                    closestDist = d;
                    closestPt = p;
                }
            }
        }
        if (closestPt) {
            draggingPoint = closestPt;
        } else {
            // Spawn a new string at the mouse location
            let s = new ElasticString(mouseX, mouseY, 35);
            s.color = currentLineColors[floor(random(currentLineColors.length))];
            strings.push(s);
        }
    }

    function mouseReleased() {
        draggingPoint = null;
    }

    function keyPressed() {
        if (key === ' ') {
            if (window.gui._hidden) {
                window.gui.show();
            } else {
                window.gui.hide();
            }
        }
    }

    function startRecording() {
        settings.reset(); // Clear existing strings and start fresh
        
        let canvas = document.querySelector('canvas');
        let stream = canvas.captureStream(30);
        
        let options = { mimeType: 'video/webm' };
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            options = { mimeType: 'video/webm;codecs=vp9' };
        }
        
        mediaRecorder = new MediaRecorder(stream, options);
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            let blob = new Blob(recordedChunks, { type: 'video/webm' });
            let url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.style = 'display: none';
            a.href = url;
            a.download = 'elastic_strings.webm';
            a.click();
            window.URL.revokeObjectURL(url);
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = millis();
        lastRecordingInterval = 0;
        settings.autoMode = true; // Turn on auto mode
        document.getElementById('recording-indicator').style.display = 'flex';
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        isRecording = false;
        settings.autoMode = false;
        document.getElementById('recording-indicator').style.display = 'none';
    }

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
        }
        
        update() {
            if (this === draggingPoint) return;
            
            this.vy += settings.gravity;
            
            this.vx *= settings.damping;
            this.vy *= settings.damping;
            
            // Clamp maximum velocity to prevent chaotic explosions
            let maxSpeed = 50;
            let speedSq = this.vx * this.vx + this.vy * this.vy;
            if (speedSq > maxSpeed * maxSpeed) {
                let speed = sqrt(speedSq);
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Wall repulsion
            let rSq = settings.repulsionRadius * settings.repulsionRadius;
            
            // Left wall
            let dxLeft = this.x - 0;
            if (dxLeft > 0 && dxLeft < settings.repulsionRadius) {
                let force = (settings.repulsionRadius - dxLeft) / settings.repulsionRadius * settings.repulsionStrength;
                this.vx += force;
            } else if (this.x < 0) {
                this.x = 0;
                if (this.vx < 0) this.vx *= -0.5;
            }
            
            // Right wall
            let dxRight = width - this.x;
            if (dxRight > 0 && dxRight < settings.repulsionRadius) {
                let force = (settings.repulsionRadius - dxRight) / settings.repulsionRadius * settings.repulsionStrength;
                this.vx -= force;
            } else if (this.x > width) {
                this.x = width;
                if (this.vx > 0) this.vx *= -0.5;
            }
            
            // Top wall
            let dyTop = this.y - 0;
            if (dyTop > 0 && dyTop < settings.repulsionRadius) {
                let force = (settings.repulsionRadius - dyTop) / settings.repulsionRadius * settings.repulsionStrength;
                this.vy += force;
            } else if (this.y < 0) {
                this.y = 0;
                if (this.vy < 0) this.vy *= -0.5;
            }
            
            // Bottom wall
            let dyBottom = height - this.y;
            if (dyBottom > 0 && dyBottom < settings.repulsionRadius) {
                let force = (settings.repulsionRadius - dyBottom) / settings.repulsionRadius * settings.repulsionStrength;
                this.vy -= force;
            } else if (this.y > height) {
                this.y = height;
                if (this.vy > 0) this.vy *= -0.5;
            }
        }
    }

    class ElasticString {
        constructor(x, y, numPoints) {
            this.points = [];
            this.color = color(255);
            
            let offsetAngle = random(TWO_PI); // Randomize starting rotation
            let waveAmplitude = 25; // Larger amplitude to match width for a square shape
            let waveFrequency = 0.3; // Lower frequency for a looser, square-like shape
            
            let tossAngle = random(TWO_PI);
            let tossSpeed = random(0, settings.initialVelocity);
            let initVx = cos(tossAngle) * tossSpeed;
            let initVy = sin(tossAngle) * tossSpeed;
            
            for (let i = 0; i < numPoints; i++) {
                // Compress the points tightly along the main axis to form a block
                let localX = i * settings.restLength * 0.1;
                
                // Perpendicular offset using a sine wave
                let localY = sin(i * waveFrequency) * waveAmplitude;
                
                // Rotate the local coordinates by offsetAngle to point in a random direction
                let globalX = x + localX * cos(offsetAngle) - localY * sin(offsetAngle);
                let globalY = y + localX * sin(offsetAngle) + localY * cos(offsetAngle);
                
                let p = new Point(globalX, globalY);
                p.vx = initVx + random(-2, 2);
                p.vy = initVy + random(-2, 2);
                this.points.push(p);
            }
        }
        
        update() {
            // Structural springs (distance between adjacent points)
            for (let i = 0; i < this.points.length - 1; i++) {
                let p1 = this.points[i];
                let p2 = this.points[i+1];
                
                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                let d = sqrt(dx*dx + dy*dy);
                
                if (d > 0) {
                    let diff = d - settings.restLength;
                    let force = diff * settings.elasticity;
                    
                    let fx = (dx / d) * force;
                    let fy = (dy / d) * force;
                    
                    p1.vx += fx;
                    p1.vy += fy;
                    p2.vx -= fx;
                    p2.vy -= fy;
                }
            }
            
            // Bending springs (distance between point i and i+2 to resist bending)
            for (let i = 0; i < this.points.length - 2; i++) {
                let p1 = this.points[i];
                let p2 = this.points[i+2];
                
                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                let d = sqrt(dx*dx + dy*dy);
                
                let targetLength = settings.restLength * 2;
                if (d > 0) {
                    let diff = d - targetLength;
                    let force = diff * settings.bendingResistance;
                    
                    let fx = (dx / d) * force;
                    let fy = (dy / d) * force;
                    
                    p1.vx += fx;
                    p1.vy += fy;
                    p2.vx -= fx;
                    p2.vy -= fy;
                }
            }
            
            // Update points position
            for (let p of this.points) {
                p.update();
            }
        }
        
        draw() {
            // Draw string connecting the points smoothly
            noFill();
            stroke(this.color);
            strokeWeight(settings.lineWidth);
            strokeJoin(ROUND);
            beginShape();
            if (this.points.length > 0) {
                curveVertex(this.points[0].x, this.points[0].y);
            }
            for (let p of this.points) {
                curveVertex(p.x, p.y);
            }
            if (this.points.length > 0) {
                curveVertex(this.points[this.points.length-1].x, this.points[this.points.length-1].y);
            }
            endShape();
        }
    }

    function windowResized() {
      resizeCanvas(windowWidth, windowHeight);
    }
  </script>
</body>
</html>
`
    if (iframeRef.current) {
      iframeRef.current.srcdoc = code
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
      className="absolute inset-0 w-full h-full border-none z-0"
      title="Elastic Strings Background"
    />
  )
}
