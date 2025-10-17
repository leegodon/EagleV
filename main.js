// AI Security Monitor - Main JavaScript File
// Advanced surveillance platform with AI-powered person detection

class AISecurityMonitor {
    constructor() {
        this.cameras = [];
        this.detectedPersons = [];
        this.alerts = [];
        this.isAIDetectionEnabled = true;
        this.currentLayout = '3x3';
        this.charts = {};
        this.activityData = [];
        
        this.init();
    }
    
    init() {
        this.setupParticleBackground();
        this.generateCameraFeeds();
        this.initializeCharts();
        this.startSimulation();
        this.setupEventListeners();
        this.initializeAnimations();
        this.startRealTimeUpdates();
    }
    
    setupParticleBackground() {
        // Create particle background using p5.js
        new p5((p) => {
            let particles = [];
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('particle-bg');
                
                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(1, 3)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                p.stroke(0, 212, 255, 30);
                p.strokeWeight(1);
                
                // Update and draw particles
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.point(particle.x, particle.y);
                    
                    // Draw connections to nearby particles
                    particles.forEach(other => {
                        const distance = p.dist(particle.x, particle.y, other.x, other.y);
                        if (distance < 100) {
                            p.stroke(0, 212, 255, 10);
                            p.line(particle.x, particle.y, other.x, other.y);
                        }
                    });
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }
    
    generateCameraFeeds() {
        const cameraGrid = document.getElementById('camera-grid');
        const layouts = {
            '2x2': 4,
            '3x3': 9,
            '4x4': 16
        };
        
        const cameraCount = layouts[this.currentLayout];
        cameraGrid.innerHTML = '';
        
        for (let i = 1; i <= cameraCount; i++) {
            const camera = {
                id: `camera-${i}`,
                name: `Security Camera ${i}`,
                status: Math.random() > 0.1 ? 'online' : 'offline',
                position: { x: Math.random() * 100, y: Math.random() * 100 },
                detection: {
                    enabled: true,
                    sensitivity: 0.7 + Math.random() * 0.3,
                    alerts: []
                }
            };
            
            this.cameras.push(camera);
            
            const cameraElement = this.createCameraElement(camera);
            cameraGrid.appendChild(cameraElement);
        }
        
        // Update grid layout
        cameraGrid.className = `grid gap-4 ${this.getGridClass(this.currentLayout)}`;
    }
    
    getGridClass(layout) {
        const classes = {
            '2x2': 'grid-cols-2',
            '3x3': 'grid-cols-3',
            '4x4': 'grid-cols-4'
        };
        return classes[layout] || 'grid-cols-3';
    }
    
    createCameraElement(camera) {
        const cameraDiv = document.createElement('div');
        cameraDiv.className = 'camera-feed rounded-lg overflow-hidden relative cursor-pointer';
        cameraDiv.id = camera.id;
        
        // Generate simulated camera feed background
        const backgroundColor = this.generateCameraBackground();
        
        cameraDiv.innerHTML = `
            <div class="aspect-video relative" style="background: ${backgroundColor}">
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                        <svg class="w-12 h-12 text-white/50 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                        </svg>
                        <p class="text-sm text-white/70">${camera.name}</p>
                    </div>
                </div>
                
                <!-- Camera Status -->
                <div class="absolute top-2 left-2 flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green' : 'bg-red'}"></div>
                    <span class="text-xs text-white bg-black/50 px-2 py-1 rounded">${camera.status.toUpperCase()}</span>
                </div>
                
                <!-- Recording Indicator -->
                <div class="absolute top-2 right-2">
                    <div class="w-3 h-3 bg-red rounded-full animate-pulse"></div>
                </div>
                
                <!-- Detection overlay will be added dynamically -->
            </div>
        `;
        
        // Add click event for camera focus
        cameraDiv.addEventListener('click', () => this.focusCamera(camera));
        
        return cameraDiv;
    }
    
    generateCameraBackground() {
        const colors = [
            'linear-gradient(45deg, #2a2d39, #3a3d49)',
            'linear-gradient(45deg, #1a2a3a, #2a3a4a)',
            'linear-gradient(45deg, #2a1a3a, #3a2a4a)',
            'linear-gradient(45deg, #1a3a2a, #2a4a3a)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    simulatePersonDetection() {
        if (!this.isAIDetectionEnabled) return;
        
        this.cameras.forEach(camera => {
            if (camera.status !== 'online') return;
            
            // Randomly detect people (30% chance per camera)
            if (Math.random() > 0.7) {
                const person = {
                    id: `person-${Date.now()}-${Math.random()}`,
                    cameraId: camera.id,
                    name: this.generatePersonName(),
                    confidence: 0.7 + Math.random() * 0.3,
                    boundingBox: {
                        x: 20 + Math.random() * 60,
                        y: 20 + Math.random() * 60,
                        width: 15 + Math.random() * 25,
                        height: 20 + Math.random() * 30
                    },
                    activity: this.getRandomActivity(),
                    timestamp: new Date()
                };
                
                // Generate advanced detection data
                const advancedDetection = this.generateAdvancedDetection();
                person.detectionType = advancedDetection.type;
                person.behavior = advancedDetection.behavior;
                person.confidence = advancedDetection.confidence;
                
                this.detectedPersons.push(person);
                this.addDetectionToCamera(camera.id, person);
                
                // Remove person after 5-10 seconds
                setTimeout(() => {
                    this.removePersonFromCamera(camera.id, person.id);
                }, 5000 + Math.random() * 5000);
            }
        });
    }
    
    generatePersonName() {
        const names = [
            'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez',
            'Lisa Wang', 'David Brown', 'Maria Garcia', 'Tom Wilson', 'Anna Taylor',
            'Chris Lee', 'Jessica Martinez', 'Ryan Anderson', 'Amy White', 'Kevin Liu',
            'Hotel Guest', 'Staff Member', 'Security Guard', 'Housekeeping', 'Manager',
            'Visitor', 'Contractor', 'Delivery Person', 'Maintenance', 'Front Desk'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    generateAdvancedDetection() {
        const detectionTypes = [
            { type: 'person', confidence: 0.95, behavior: 'normal' },
            { type: 'person', confidence: 0.88, behavior: 'loitering' },
            { type: 'person', confidence: 0.92, behavior: 'unauthorized_access' },
            { type: 'person', confidence: 0.85, behavior: 'suspicious_activity' },
            { type: 'vehicle', confidence: 0.90, behavior: 'unauthorized_parking' },
            { type: 'object', confidence: 0.78, behavior: 'left_behind' },
            { type: 'person', confidence: 0.96, behavior: 'staff_member' },
            { type: 'person', confidence: 0.89, behavior: 'guest' },
            { type: 'person', confidence: 0.91, behavior: 'delivery_personnel' }
        ];
        
        return detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    }
    
    getRandomActivity() {
        const activities = ['working', 'break', 'away', 'alert'];
        const weights = [0.6, 0.2, 0.15, 0.05]; // Probability weights
        
        let random = Math.random();
        for (let i = 0; i < weights.length; i++) {
            if (random < weights[i]) return activities[i];
            random -= weights[i];
        }
        return activities[0];
    }
    
    addDetectionToCamera(cameraId, person) {
        const cameraElement = document.getElementById(cameraId);
        if (!cameraElement) return;
        
        // Create detection bounding box
        const detectionBox = document.createElement('div');
        detectionBox.className = 'detection-box';
        detectionBox.id = `detection-${person.id}`;
        detectionBox.style.left = `${person.boundingBox.x}%`;
        detectionBox.style.top = `${person.boundingBox.y}%`;
        detectionBox.style.width = `${person.boundingBox.width}%`;
        detectionBox.style.height = `${person.boundingBox.height}%`;
        
        // Create name tag
        const nameTag = document.createElement('div');
        nameTag.className = 'name-tag';
        nameTag.id = `nametag-${person.id}`;
        nameTag.style.left = `${person.boundingBox.x}%`;
        nameTag.style.top = `${person.boundingBox.y - 8}%`;
        nameTag.innerHTML = `
            ${person.name}
            <div class="status-indicator status-${person.activity} ml-1"></div>
        `;
        
        cameraElement.appendChild(detectionBox);
        cameraElement.appendChild(nameTag);
        
        // Animate the detection
        anime({
            targets: [detectionBox, nameTag],
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 500,
            easing: 'easeOutQuart'
        });
    }
    
    removePersonFromCamera(cameraId, personId) {
        const detectionBox = document.getElementById(`detection-${personId}`);
        const nameTag = document.getElementById(`nametag-${personId}`);
        
        if (detectionBox || nameTag) {
            anime({
                targets: [detectionBox, nameTag].filter(el => el),
                opacity: 0,
                scale: 0.8,
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    if (detectionBox) detectionBox.remove();
                    if (nameTag) nameTag.remove();
                }
            });
        }
        
        // Remove from detected persons array
        this.detectedPersons = this.detectedPersons.filter(p => p.id !== personId);
    }
    
    focusCamera(camera) {
        // Create fullscreen overlay for focused camera view
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8';
        overlay.id = 'camera-focus-overlay';
        
        overlay.innerHTML = `
            <div class="relative w-full max-w-4xl">
                <button id="close-focus" class="absolute -top-12 right-0 text-white hover:text-cyan text-2xl">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
                
                <div class="camera-feed rounded-xl overflow-hidden">
                    <div class="aspect-video relative" style="background: ${this.generateCameraBackground()}">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center">
                                <svg class="w-24 h-24 text-white/50 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                                </svg>
                                <p class="text-xl text-white/70">${camera.name}</p>
                            </div>
                        </div>
                        
                        <div class="absolute top-4 left-4">
                            <div class="w-3 h-3 rounded-full bg-green"></div>
                        </div>
                        
                        <div class="absolute bottom-4 left-4 right-4">
                            <div class="glass-panel rounded-lg p-4">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h4 class="text-white font-semibold">${camera.name}</h4>
                                        <p class="text-gray text-sm">Streaming • HD Quality</p>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <button class="p-2 text-white hover:text-cyan">
                                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                                            </svg>
                                        </button>
                                        <button class="p-2 text-white hover:text-cyan">
                                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add close functionality
        document.getElementById('close-focus').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // Simulate current detections in focused view
        this.simulateFocusDetections(overlay);
    }
    
    simulateFocusDetections(overlay) {
        // Add some detection boxes to the focused view for demo
        const focusedView = overlay.querySelector('.aspect-video');
        
        for (let i = 0; i < 2; i++) {
            const detection = {
                x: 20 + i * 30 + Math.random() * 20,
                y: 30 + Math.random() * 40,
                width: 15 + Math.random() * 10,
                height: 25 + Math.random() * 15
            };
            
            const detectionBox = document.createElement('div');
            detectionBox.className = 'detection-box';
            detectionBox.style.left = `${detection.x}%`;
            detectionBox.style.top = `${detection.y}%`;
            detectionBox.style.width = `${detection.width}%`;
            detectionBox.style.height = `${detection.height}%`;
            
            focusedView.appendChild(detectionBox);
        }
    }
    
    initializeCharts() {
        // Person Count Timeline Chart
        const personCountChart = echarts.init(document.getElementById('person-count-chart'));
        const personCountOption = {
            backgroundColor: 'transparent',
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                axisLine: { lineStyle: { color: '#6c7293' } },
                axisLabel: { color: '#6c7293', fontSize: 10 }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#6c7293' } },
                axisLabel: { color: '#6c7293', fontSize: 10 },
                splitLine: { lineStyle: { color: '#2a2d39' } }
            },
            series: [{
                data: [3, 5, 12, 8, 15, 10, 6],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#00d4ff', width: 2 },
                itemStyle: { color: '#00d4ff' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
                        ]
                    }
                }
            }]
        };
        personCountChart.setOption(personCountOption);
        this.charts.personCount = personCountChart;
        
        // Activity Heatmap
        const heatmapChart = echarts.init(document.getElementById('activity-heatmap'));
        const heatmapData = [];
        
        // Generate heatmap data
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 7; j++) {
                heatmapData.push([i, j, Math.floor(Math.random() * 20)]);
            }
        }
        
        const heatmapOption = {
            backgroundColor: 'transparent',
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: Array.from({length: 24}, (_, i) => `${i}:00`),
                axisLine: { lineStyle: { color: '#6c7293' } },
                axisLabel: { color: '#6c7293', fontSize: 10 }
            },
            yAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: '#6c7293' } },
                axisLabel: { color: '#6c7293', fontSize: 10 }
            },
            visualMap: {
                min: 0,
                max: 20,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%',
                inRange: {
                    color: ['#0f1419', '#1a1d29', '#00d4ff', '#00ff88']
                },
                textStyle: { color: '#6c7293', fontSize: 10 }
            },
            series: [{
                name: 'Activity',
                type: 'heatmap',
                data: heatmapData,
                itemStyle: {
                    borderRadius: 2
                }
            }]
        };
        heatmapChart.setOption(heatmapOption);
        this.charts.heatmap = heatmapChart;
    }
    
    startSimulation() {
        // Start person detection simulation
        setInterval(() => {
            this.simulatePersonDetection();
        }, 2000);
        
        // Generate system alerts
        setInterval(() => {
            this.generateRandomAlert();
        }, 15000); // Every 15 seconds
        
        // Update system metrics
        setInterval(() => {
            this.updateSystemMetrics();
        }, 3000);
        
        // Update activity feed
        setInterval(() => {
            this.updateActivityFeed();
        }, 5000);
    }
    
    generateRandomAlert() {
        const alertTypes = [
            {
                type: 'motion',
                title: 'Motion Detected',
                message: 'Unusual movement detected in Camera ' + Math.floor(Math.random() * 9 + 1),
                severity: 'warning'
            },
            {
                type: 'person',
                title: 'Person Detected',
                message: 'New person identified in restricted area',
                severity: 'info'
            },
            {
                type: 'system',
                title: 'System Alert',
                message: 'Camera offline - Camera ' + Math.floor(Math.random() * 9 + 1),
                severity: 'error'
            }
        ];
        
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        this.showAlert(alert);
    }
    
    showAlert(alert) {
        const alertPopup = document.getElementById('alert-popup');
        const alertTitle = document.getElementById('alert-title');
        const alertMessage = document.getElementById('alert-message');
        
        alertTitle.textContent = alert.title;
        alertMessage.textContent = alert.message;
        
        // Update alert count
        const alertCount = document.getElementById('alert-count');
        const currentCount = parseInt(alertCount.textContent);
        alertCount.textContent = currentCount + 1;
        
        // Show popup
        alertPopup.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertPopup.classList.add('hidden');
        }, 5000);
    }
    
    updateSystemMetrics() {
        // Simulate CPU, Memory, and Network usage
        const cpuBar = document.getElementById('cpu-bar');
        const memoryBar = document.getElementById('memory-bar');
        const networkBar = document.getElementById('network-bar');
        
        const cpuUsage = 40 + Math.random() * 40; // 40-80%
        const memoryUsage = 60 + Math.random() * 30; // 60-90%
        const networkUsage = 20 + Math.random() * 60; // 20-80%
        
        anime({
            targets: cpuBar,
            width: `${cpuUsage}%`,
            duration: 1000,
            easing: 'easeOutQuart'
        });
        
        anime({
            targets: memoryBar,
            width: `${memoryUsage}%`,
            duration: 1000,
            easing: 'easeOutQuart'
        });
        
        anime({
            targets: networkBar,
            width: `${networkUsage}%`,
            duration: 1000,
            easing: 'easeOutQuart'
        });
        
        // Update percentage text
        cpuBar.nextElementSibling.textContent = `${Math.round(cpuUsage)}%`;
        memoryBar.nextElementSibling.textContent = `${Math.round(memoryUsage)}%`;
        networkBar.nextElementSibling.textContent = `${Math.round(networkUsage)}%`;
    }
    
    updateActivityFeed() {
        const activityFeed = document.getElementById('activity-feed');
        const activities = [
            'Person detected in Zone A',
            'Motion alert triggered',
            'Camera 5 went offline',
            'New face recognized',
            'System backup completed',
            'Alert rule activated',
            'User logged in',
            'Recording started'
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const timestamp = new Date().toLocaleTimeString();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors';
        activityItem.innerHTML = `
            <div class="w-2 h-2 bg-cyan rounded-full mt-2 flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-white">${randomActivity}</p>
                <p class="text-xs text-gray mt-1">${timestamp}</p>
            </div>
        `;
        
        // Add to top of feed
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Remove old items if more than 5
        while (activityFeed.children.length > 5) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
        
        // Animate new item
        anime({
            targets: activityItem,
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 500,
            easing: 'easeOutQuart'
        });
    }
    
    setupEventListeners() {
        // Camera layout selector
        const cameraLayout = document.getElementById('camera-layout');
        cameraLayout.addEventListener('change', (e) => {
            this.currentLayout = e.target.value;
            this.cameras = []; // Clear existing cameras
            this.generateCameraFeeds();
        });
        
        // AI Detection toggle
        const aiToggle = document.getElementById('ai-toggle');
        const aiToggleSlider = document.getElementById('ai-toggle-slider');
        aiToggle.addEventListener('click', () => {
            this.isAIDetectionEnabled = !this.isAIDetectionEnabled;
            aiToggle.classList.toggle('bg-green');
            aiToggle.classList.toggle('bg-gray');
            
            if (this.isAIDetectionEnabled) {
                aiToggleSlider.style.transform = 'translateX(24px)';
            } else {
                aiToggleSlider.style.transform = 'translateX(0)';
                // Clear all detections
                this.clearAllDetections();
            }
        });
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Alert close button
        const alertClose = document.getElementById('alert-close');
        alertClose.addEventListener('click', () => {
            document.getElementById('alert-popup').classList.add('hidden');
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => {
                chart.resize();
            });
        });
    }
    
    clearAllDetections() {
        this.detectedPersons.forEach(person => {
            this.removePersonFromCamera(person.cameraId, person.id);
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    initializeAnimations() {
        // Animate main title
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
            new Typed(mainTitle, {
                strings: ['Security Operations Center', 'AI-Powered Surveillance', 'Real-Time Monitoring'],
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 2000,
                loop: true
            });
        }
        
        // Animate metric cards
        anime({
            targets: '.metric-card',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutQuart'
        });
        
        // Animate camera feeds with stable animation
        anime({
            targets: '.camera-feed',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(50),
            duration: 600,
            easing: 'easeOutQuart'
        });
    }
    
    startRealTimeUpdates() {
        // Update people count every 2 seconds
        setInterval(() => {
            const peopleCount = document.getElementById('people-count');
            const currentCount = parseInt(peopleCount.textContent);
            const newCount = Math.max(0, currentCount + Math.floor(Math.random() * 3) - 1);
            
            anime({
                targets: peopleCount,
                innerHTML: [currentCount, newCount],
                duration: 1000,
                round: 1,
                easing: 'easeOutQuart'
            });
        }, 2000);
        
        // Update active cameras count
        setInterval(() => {
            const activeCameras = document.getElementById('active-cameras');
            const onlineCameras = this.cameras.filter(cam => cam.status === 'online').length;
            
            anime({
                targets: activeCameras,
                innerHTML: onlineCameras,
                duration: 1000,
                round: 1,
                easing: 'easeOutQuart'
            });
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AISecurityMonitor();
    
    // Add some initial activity to make it look live
    setTimeout(() => {
        app.updateActivityFeed();
        app.updateActivityFeed();
    }, 1000);
});

// Export for use in other modules
window.AISecurityMonitor = AISecurityMonitor;