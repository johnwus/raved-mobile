// This file contains the JavaScript code that handles the logic for fetching media items, displaying them, and capturing user responses.

const mediaUrls = [
    // Images - Unsplash (People)
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300',
    'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=300',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
    'https://images.unsplash.com/photo-1543269865-cbdf26effbad?w=300',
    'https://images.unsplash.com/photo-1539571696357-5a69c006e3a3?w=300',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
    'https://images.unsplash.com/photo-1507371341519-f6ba6efd0437?w=300',
    'https://images.unsplash.com/photo-1546288996-fb3fc6f95f98?w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    'https://images.unsplash.com/photo-1511367461735-ff33b52fe017?w=300',
    'https://images.unsplash.com/photo-1516763981632-b6894c3b14d9?w=300',
    
    // Images - Unsplash (Fashion & Products)
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300',
    'https://images.unsplash.com/photo-1535638066725-07c74f1f76cc?w=300',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
    'https://images.unsplash.com/photo-1488161628813-04466f521898?w=300',
    'https://images.unsplash.com/photo-1595777707802-221b926f1e89?w=300',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=300',
    'https://images.unsplash.com/photo-1589411871446-8260a0b37c3b?w=300',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300',
    'https://images.unsplash.com/photo-1595429676514-55df319b08fa?w=300',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300',
    'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=300',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    'https://images.unsplash.com/photo-1515132531921-4e8ce2270952?w=300',
    'https://images.unsplash.com/photo-1515562141207-5dab927213ad?w=300',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    
    // Images - Unsplash (Nature & Landscape)
    'https://images.unsplash.com/photo-1506704720897-c6b0b8ef6dba?w=300',
    'https://images.unsplash.com/photo-1469022563149-aa2dcc928a5b?w=300',
    'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300',
    'https://images.unsplash.com/photo-1518639830385-c6f3f1b912ee?w=300',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=300',
    'https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=300',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300',
    'https://images.unsplash.com/photo-1500534316185-32044f6ba0fb?w=300',
    'https://images.unsplash.com/photo-1501870190551-b4fbc7bdac5a?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1509803874396-fd0408dc6d0b?w=300',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    'https://images.unsplash.com/photo-1514041957006-4d8f003aaac1?w=300',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    
    // Images - Unsplash (Food & Lifestyle)
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
    'https://images.unsplash.com/photo-1495543316433-d56f8f9b36e0?w=300',
    'https://images.unsplash.com/photo-1490543334519-c21e6bf27e75?w=300',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    'https://images.unsplash.com/photo-1506353333306-eeebf8ae8a9c?w=300',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    'https://images.unsplash.com/photo-1495542779398-7d41a9f3bf00?w=300',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    'https://images.unsplash.com/photo-1548521548-afac4c92b635?w=300',
    'https://images.unsplash.com/photo-1509459873494-20a1e37e9c25?w=300',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    'https://images.unsplash.com/photo-1532634726-8fca62fc60d2?w=300',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
    'https://images.unsplash.com/photo-1495542779398-7d41a9f3bf00?w=300',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300',
    
    // Images - Unsplash (Tech & Gadgets)
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
    'https://images.unsplash.com/photo-1516321318423-f06f70570ec0?w=300',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
    'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=300',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300',
    'https://images.unsplash.com/photo-1591290621512-c906f7e404b0?w=300',
    'https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=300',
    'https://images.unsplash.com/photo-1547022783-c7eb0c5a5c1f?w=300',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
    'https://images.unsplash.com/photo-1551069613-1d938da7a72e?w=300',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300',
    'https://images.unsplash.com/photo-1514306688989-41e0fb81b850?w=300',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=300',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300',
    
    // Images - Unsplash (Sports & Activity)
    'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300',
    'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300',
    'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300',
    'https://images.unsplash.com/photo-1552674605-5defe6aa44bb?w=300',
    'https://images.unsplash.com/photo-1535751038935-c69ba3e52872?w=300',
    'https://images.unsplash.com/photo-1520007318506-40a2713a64c5?w=300',
    'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300',
    'https://images.unsplash.com/photo-1552674605-5defe6aa44bb?w=300',
    'https://images.unsplash.com/photo-1512625917554-b0faa078cc8a?w=300',
    'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=300',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300',
    'https://images.unsplash.com/photo-1543508282-487bdbe18702?w=300',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300',
    'https://images.unsplash.com/photo-1518611505868-48510c2e2e3f?w=300',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300',
    'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300',
    
    // Images - Unsplash (Business & Work)
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1556740722-a3b35e9066b2?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1556740722-a3b35e9066b2?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1556740722-a3b35e9066b2?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    'https://images.unsplash.com/photo-1556740722-a3b35e9066b2?w=300',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
    
    // Images - Unsplash (Animals & Pets)
    'https://images.unsplash.com/photo-1552053831-71594a27c62d?w=300',
    'https://images.unsplash.com/photo-1558191053-7ba0d5bfb5e3?w=300',
    'https://images.unsplash.com/photo-1573865526014-f3550beaae6e?w=300',
    'https://images.unsplash.com/photo-1552053831-71594a27c62d?w=300',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300',
    'https://images.unsplash.com/photo-1552053831-71594a27c62d?w=300',
    'https://images.unsplash.com/photo-1587300411515-430ee3e80abe?w=300',
    'https://images.unsplash.com/photo-1542652694d2-6f3b8d19f90f?w=300',
    'https://images.unsplash.com/photo-1573865526014-f3550beaae6e?w=300',
    'https://images.unsplash.com/photo-1548681528-6dbf84fcf1f7?w=300',
    
    // Images - Unsplash (Architecture & Urban)
    'https://images.unsplash.com/photo-1512497206365-ecc7e778bd2d?w=300',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300',
    'https://images.unsplash.com/photo-1486718860603-28d57a64e5f8?w=300',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300',
    'https://images.unsplash.com/photo-1486967712359-fea4f5c359bf?w=300',
    'https://images.unsplash.com/photo-1486717014519-3ec03cba8138?w=300',
    'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=300',
    'https://images.unsplash.com/photo-1500854212657-332ec28b7dd3?w=300',
    
    // Videos - Google Commons (High Quality & Tested)
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    
    // Videos - W3Schools (Tested)
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://www.w3schools.com/html/movie.mp4',
];

let currentIndex = 0;
const results = [];
const container = document.getElementById('media-container');
const resultsTextarea = document.getElementById('results-textarea');

function showMedia(index) {
    container.innerHTML = '';
    if (index >= mediaUrls.length) {
        updateResults();
        return;
    }
    const url = mediaUrls[index];
    const isVideo = url.includes('.mp4');
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.innerHTML = `
        <p>Media ${index + 1} of ${mediaUrls.length}</p>
        ${isVideo ? `<video class="media-display" controls><source src="${url}" type="video/mp4"></video>` : `<img class="media-display" src="${url}" alt="Media">`}
        <div class="buttons">
            <button onclick="markBroken(${index})">Broken</button>
            <button onclick="markWorking(${index})">Working</button>
        </div>
        <div class="type-selection" id="type-${index}">
            <button onclick="classify(${index}, 'product')">Product</button>
            <button onclick="classify(${index}, 'user_post')">User Post</button>
        </div>
    `;
    container.appendChild(mediaItem);
    mediaItem.style.display = 'block';
}

function markBroken(index) {
    results.push({ url: mediaUrls[index], status: 'broken' });
    currentIndex++;
    showMedia(currentIndex);
}

function markWorking(index) {
    document.getElementById(`type-${index}`).style.display = 'block';
}

function classify(index, type) {
    results.push({ url: mediaUrls[index], status: 'working', type: type });
    currentIndex++;
    showMedia(currentIndex);
}

function updateResults() {
    resultsTextarea.value = JSON.stringify(results, null, 2);
}

// Start
showMedia(currentIndex);