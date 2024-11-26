const fileInput = document.getElementById('file-input');
const contactSheet = document.getElementById('contact-sheet');
const downloadBtn = document.getElementById('download-btn');

// Handle file input
fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

// Process uploaded files
async function handleFiles(files) {
    const validExtensions = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    contactSheet.innerHTML = ''; // Clear previous images

    for (const file of files) {
        if (validExtensions.includes(file.type)) {
            const container = document.createElement('div');
            container.classList.add('image-container');

            // Create filename label
            const filenameLabel = document.createElement('div');
            filenameLabel.classList.add('filename');
            filenameLabel.textContent = file.name;
            container.appendChild(filenameLabel);

            // Process and add image
            try {
                const croppedImg = await processFile(file);
                container.appendChild(croppedImg);
                contactSheet.appendChild(container);
            } catch (error) {
                alert(`Error processing ${file.name}: ${error.message}`);
            }
        } else {
            alert(`${file.name} is not a supported file type.`);
        }
    }

    // Enable download button if images are added
    if (contactSheet.childNodes.length > 0) {
        downloadBtn.disabled = false;
    }
}

// Process a file (including HEIC conversion if needed)
async function processFile(file) {
    let convertedFile = file;

    // Convert HEIC files to JPEG
    if (file.type === 'image/heic') {
        try {
            const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
            convertedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg',
            });
        } catch (error) {
            throw new Error('Failed to convert HEIC file.');
        }
    }

    return cropToSquare(convertedFile);
}

// Crop image to square using canvas
async function cropToSquare(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const size = Math.min(img.width, img.height); // Get the smallest dimension for cropping
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = 150; // Target square dimensions
            canvas.height = 150;

            // Calculate cropping offsets to center the crop
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;

            // Draw cropped image onto canvas
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, canvas.width, canvas.height);

            // Create a new image element from the canvas
            const croppedImg = new Image();
            croppedImg.src = canvas.toDataURL();
            croppedImg.style.width = '150px';
            croppedImg.style.height = '150px';
            resolve(croppedImg);
        };

        img.onerror = (error) => reject(error);

        // Read the file as a data URL (supports all file types)
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}
// Download contact sheet as PNG
downloadBtn.addEventListener('click', () => {
    const scaleFactor = 16; // Increase for higher resolution (e.g., 2 = 2x, 4 = 4x)

    html2canvas(contactSheet, {
        scale: scaleFactor, // Set the scale factor for higher resolution
        backgroundColor: '#fff',
        useCORS: true, // Avoid cross-origin issues for images
    }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'contact-sheet.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
