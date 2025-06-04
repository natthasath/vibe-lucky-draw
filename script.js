// Lucky Draw Wheel - JavaScript Functions

// Global Variables
let participants = [];
let winners = [];
let isSpinning = false;

// Color palette for wheel segments
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C',
    '#FF7F50', '#9370DB', '#3CB371', '#FFB347', '#DEB887'
];

// Utility Functions
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function getGradientColor(baseColor, index, total) {
    const hueShift = (index * 360) / total;
    return `linear-gradient(135deg, ${baseColor}, ${adjustBrightness(baseColor, -20)})`;
}

// Main Functions
function addParticipant() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();

    if (name === '') {
        alert('กรุณาใส่ชื่อ-นามสกุล');
        return;
    }

    if (participants.includes(name)) {
        alert('ชื่อนี้มีอยู่แล้ว');
        return;
    }

    participants.push(name);
    nameInput.value = '';
    updateWheel();
    updateParticipantCount();
    
    // Focus back to input for quick adding
    nameInput.focus();
}

function updateWheel() {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');

    if (participants.length === 0) {
        wheel.innerHTML = `
            <div class="no-participants">
                <div style="font-size: 48px;">🎪</div>
                <div>เพิ่มชื่อผู้เข้าร่วมเพื่อเริ่มเล่น</div>
            </div>
            <div class="wheel-center">🎯</div>
        `;
        spinButton.disabled = true;
        return;
    }

    spinButton.disabled = false;
    
    const radius = 200;
    const centerX = 225;
    const centerY = 225;
    const anglePerSegment = (2 * Math.PI) / participants.length;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 450 450');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Create defs for gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    participants.forEach((name, index) => {
        // Position segments correctly with pointer alignment
        const startAngle = (index * anglePerSegment) - (anglePerSegment / 2) - (Math.PI / 2);
        const endAngle = ((index + 1) * anglePerSegment) - (anglePerSegment / 2) - (Math.PI / 2);
        
        // Calculate path coordinates
        const x1 = centerX + Math.cos(startAngle) * radius;
        const y1 = centerY + Math.sin(startAngle) * radius;
        const x2 = centerX + Math.cos(endAngle) * radius;
        const y2 = centerY + Math.sin(endAngle) * radius;
        
        const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;
        
        // Create path for cake slice
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        // Create gradient for this segment
        const gradientId = `gradient-${index}`;
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const baseColor = colors[index % colors.length];
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', baseColor);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', adjustBrightness(baseColor, -20));

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);

        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', `url(#${gradientId})`);
        path.setAttribute('class', 'wheel-segment');
        path.setAttribute('data-index', index);
        
        // Add hover effects
        path.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.1) drop-shadow(0 2px 8px rgba(0,0,0,0.3))';
        });
        
        path.addEventListener('mouseleave', function() {
            this.style.filter = '';
        });

        svg.appendChild(path);

        // Add text
        const textAngle = (startAngle + endAngle) / 2;
        const textRadius = radius * 0.7;
        const textX = centerX + Math.cos(textAngle) * textRadius;
        const textY = centerY + Math.sin(textAngle) * textRadius;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('class', 'segment-text');
        text.setAttribute('transform', `rotate(${(textAngle * 180 / Math.PI) + 90}, ${textX}, ${textY})`);
        
        // Truncate long names
        const displayName = name.length > 12 ? name.substring(0, 10) + '...' : name;
        text.textContent = displayName;
        text.setAttribute('title', name);

        svg.appendChild(text);
    });

    wheel.innerHTML = '';
    wheel.appendChild(svg);
    
    // Add center circle
    const centerDiv = document.createElement('div');
    centerDiv.className = 'wheel-center';
    centerDiv.textContent = '🎯';
    wheel.appendChild(centerDiv);
}

function updateParticipantCount() {
    const countElement = document.getElementById('participantCount');
    countElement.textContent = `ผู้เข้าร่วม: ${participants.length} คน`;
}

function spinWheel() {
    if (isSpinning || participants.length === 0) return;

    isSpinning = true;
    const spinButton = document.getElementById('spinButton');
    const wheel = document.getElementById('wheel');
    
    spinButton.disabled = true;
    spinButton.textContent = '🎯 กำลังหมุน...';
    
    // Add spinning effect
    wheel.classList.add('spinning');

    // Random spin amount (multiple rotations + random angle)
    const minSpins = 8;
    const maxSpins = 15;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const finalAngle = Math.random() * 360;
    const totalRotation = (spins * 360) + finalAngle;

    // Add easing and smooth rotation
    wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    // Calculate winner after spin
    setTimeout(() => {
        wheel.classList.remove('spinning');
        
        // Calculate winner based on pointer position
        const finalRotationAngle = totalRotation % 360;
        const adjustedAngle = (360 - finalRotationAngle) % 360;
        const anglePerSegment = 360 / participants.length;
        
        // Find winner from segment that pointer points to
        const winnerIndex = Math.floor((adjustedAngle + (anglePerSegment / 2)) / anglePerSegment) % participants.length;
        const winner = participants[winnerIndex];

        // Highlight winner segment briefly
        highlightWinnerSegment(winnerIndex);
        
        setTimeout(() => {
            showWinner(winner);
            removeWinner(winner);
            
            isSpinning = false;
            spinButton.disabled = participants.length === 0;
            spinButton.textContent = '🎯 หมุนวงล้อ';
        }, 1000);
    }, 4000);
}

function highlightWinnerSegment(winnerIndex) {
    const wheel = document.getElementById('wheel');
    const segments = wheel.querySelectorAll('.wheel-segment');
    
    // Find segment that matches winnerIndex
    segments.forEach((segment, index) => {
        const dataIndex = parseInt(segment.getAttribute('data-index'));
        if (dataIndex === winnerIndex) {
            segment.style.filter = 'brightness(1.3) drop-shadow(0 0 15px rgba(255,215,0,0.8))';
            segment.style.transform = 'scale(1.05)';
            segment.style.transformOrigin = 'center';
            
            setTimeout(() => {
                segment.style.filter = '';
                segment.style.transform = '';
            }, 800);
        }
    });
}

function showWinner(winner) {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('winnerModal');
    const winnerName = document.getElementById('winnerName');

    winnerName.textContent = winner;
    overlay.classList.add('show');
    modal.classList.add('show');
}

function closeWinnerModal() {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('winnerModal');
    
    overlay.classList.remove('show');
    modal.classList.remove('show');
}

function removeWinner(winner) {
    const winnerIndex = participants.indexOf(winner);
    if (winnerIndex > -1) {
        participants.splice(winnerIndex, 1);
        winners.push(winner);
        updateWheel();
        updateParticipantCount();
        updateWinnersList();
    }
}

function updateWinnersList() {
    const winnersList = document.getElementById('winnersList');
    
    if (winners.length === 0) {
        winnersList.innerHTML = `
            <div style="text-align: center; color: #6c757d; font-style: italic;">
                ยังไม่มีผู้ชนะ
            </div>
        `;
        return;
    }

    winnersList.innerHTML = winners.map((winner, index) => `
        <div class="winner-item">
            <span>${winner}</span>
            <div class="winner-number">${index + 1}</div>
        </div>
    `).join('');
}

function clearAll() {
    if (confirm('คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?')) {
        participants = [];
        winners = [];
        updateWheel();
        updateParticipantCount();
        updateWinnersList();
        
        // Reset wheel rotation with smooth transition
        const wheel = document.getElementById('wheel');
        wheel.style.transition = 'transform 0.5s ease-out';
        wheel.style.transform = 'rotate(0deg)';
        
        // Remove transition after reset
        setTimeout(() => {
            wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }, 500);
    }
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Enter key support for input
    document.getElementById('nameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addParticipant();
        }
    });

    // Close modal when clicking overlay
    document.getElementById('overlay').addEventListener('click', closeWinnerModal);

    // Initialize
    updateWheel();
    updateParticipantCount();
    updateWinnersList();
});