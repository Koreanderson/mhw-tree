const baseUrl = 'https://mhw-db.com';

// Build Inventory
function setInventory() {
  const existingInventoryData = localStorage.getItem('mhwInventory');
  if (existingInventoryData) {
    updateWeaponInventoryDisplay();
  } else {
    localStorage.setItem('mhwInventory', '');
  }
}

function addWeaponToInventory(weaponName) {
  const inventory = localStorage.getItem('mhwInventory').split(',');
  if (inventory == '') {
    localStorage.setItem('mhwInventory', weaponName);
  } else {
    inventory.push(weaponName);
    const filteredInventory = Array.from(new Set(inventory));
    localStorage.setItem('mhwInventory', filteredInventory);
  }
  updateWeaponInventoryDisplay();
}

function removeWeaponFromInventory(weaponName) {
  const inventory = localStorage.getItem('mhwInventory').split(',');
  const inventoryContainer = document.getElementById('currentInventory');
  const index = inventory.indexOf(weaponName);
  inventory.splice(index,1);
  localStorage.setItem('mhwInventory', inventory);
  updateWeaponInventoryDisplay();
}

function updateWeaponInventoryDisplay() {
  const inventory = localStorage.getItem('mhwInventory').split(',');
  const inventoryContainer = document.getElementById('currentInventory');
  inventoryContainer.innerHTML = '';
  if(inventory[0] != '') {
    inventory.map((weaponName) => {
      let item = document.createElement('div');
      let itemInner = document.createElement('dev');
      let removeItem = document.createElement('div');

      item.classList.add('inventory-item'); 

      removeItem.innerHTML = 'remove item';
      itemInner.innerHTML = weaponName;

      removeItem.addEventListener('click', async function() {
        removeWeaponFromInventory(weaponName);
      });

      item.append(itemInner);
      item.append(removeItem);

      inventoryContainer.appendChild(item)
    });
  }
}

// Build Wishlist 
function setWishlist() {
  const wishlist = localStorage.getItem('mhwWishlist');
  if (wishlist) {
    updateWishlistDisplay();
  } else {
    localStorage.setItem('mhwWishlist', '');
  }
}

function updateWishlistDisplay() {
  const wishlist = localStorage.getItem('mhwWishlist').split(',');
  const wishlistContainer = document.getElementById('wishlist');
  wishlistContainer.innerHTML = '';
  if(wishlist[0] != '') {
    wishlist.map((weaponName) => {
      let item = document.createElement('div');
      let viewItem = document.createElement('div');

      let removeItem = document.createElement('div');
      removeItem.innerHTML = 'remove item';

      viewItem.classList.add('view-item');
      viewItem.innerHTML = weaponName;

      removeItem.classList.add('remove-item');

      item.append(viewItem);
      item.append(removeItem);
      item.classList.add('wishlist-item');
      item.setAttribute('data-name', weapon); 

      viewItem.addEventListener('click', async function() {
        const weaponObj = await getWeaponByName(weaponName);
        let newWeaponTree = [];
        const weaponEl = this.getAttribute('data-name');

        displayWeaponRequirementsByName(weaponName);
        displayWeaponTree(newWeaponTree, weaponObj.id);
      });

      removeItem.addEventListener('click', async function() {
        removeWeaponFromWishList(weaponName);
      });

      wishlistContainer.appendChild(item)

    });
  }
}

function removeWeaponFromWishList(weaponName) {
  const wishlist = localStorage.getItem('mhwWishlist').split(',');
  const index = wishlist.indexOf(weaponName);
  wishlist.splice(index,1);
  localStorage.setItem('mhwWishlist', wishlist);
  updateWishlistDisplay();
}

function addWeaponToWishlist(weaponName) {
  const wishlist = localStorage.getItem('mhwWishlist').split(',');
  if (wishlist == '') {
    localStorage.setItem('mhwWishlist', weaponName);
  } else {
    wishlist.push(weaponName);
    const filteredWishlist = Array.from(new Set(wishlist));
    localStorage.setItem('mhwWishlist', filteredWishlist);
  }
  updateWishlistDisplay();
}

async function getInventoryWeapons(inventoryWeaponIds) {
  const pWeaponIds = inventoryWeaponIds.map(async (id) => {
    const response = await getWeaponById(id);
    return response;
  });
  const inventoryWeapons = await Promise.all(pWeaponIds);
}

async function getWeaponById(id) {
  const url = baseUrl + '/weapons/' + id;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getWeaponByName(name) {
  const url = baseUrl + '/weapons/?q={"name":"' + name + '"}';
  const response = await fetch(url);
  const json = await response.json();
  return json[0];
}

async function getWeaponRequirementsById(id) {
  const weapon = await getWeaponById(id);
  const lastWeaponId = weapon.crafting.previous;
  const lastWeapon = await getWeaponById(lastWeaponId);
  const requiredMats = lastWeapon.crafting.upgradeMaterials;
  const requiredMatsContainer = document.getElementById('requiredMaterials');

  document.getElementById('weapon').innerHTML = 'Current Weapon: ' + weapon.name;
  document.getElementById('lastWeapon').innerHTML = 'Last Weapon: ' + lastWeapon.name;

  requiredMats.map((mat) => {

    let item = document.createElement("div");
    item.innerHTML = mat.quantity + "- " + mat.item.name;
    requiredMatsContainer.appendChild(item)

  });
}

async function getWeaponRequirementsByName(name) {

  const weapon = await getWeaponByName(name);
  const isCraftable = weapon.crafting.craftable;
  const weaponRequirements =[];

  if (isCraftable) {

    const requiredMats = weapon.crafting.craftingMaterials;
    requiredMats.map((mat) => {
      weaponRequirements.push(mat);
    });

  } else {

    const allPrequisiteWeapons = [];
    const lastWeaponId = weapon.crafting.previous;
    const lastWeapon = await getWeaponById(lastWeaponId);
    const requiredMats = lastWeapon.crafting.upgradeMaterials;

    requiredMats.map((mat) => {
      weaponRequirements.push(mat);
    });
  }

  return weaponRequirements
}

async function displayWeaponRequirementsByName(name) {

  const weapon = await getWeaponByName(name);
  const isCraftable = weapon.crafting.craftable;

  document.getElementById('weapon').innerHTML = weapon.name;

  if (isCraftable) {

    document.querySelector('.crafting-info').style.display = 'block';
    document.querySelector('.upgrade-info').style.display = 'none';

    const requiredMats = weapon.crafting.craftingMaterials;
    const requiredMatsContainer = document.getElementById('requiredCraftingMaterials');

    requiredMatsContainer.innerHTML = '';
    requiredMats.map((mat) => {

      let item = document.createElement("div");
      item.innerHTML = mat.item.name + " <strong>x" + mat.quantity + "</strong>";
      requiredMatsContainer.appendChild(item)

    });
  } else {

    const allPrequisiteWeapons = [];
    document.querySelector('.upgrade-info').style.display = 'block';
    document.querySelector('.crafting-info').style.display = 'none';

    const lastWeaponId = weapon.crafting.previous;
    const lastWeapon = await getWeaponById(lastWeaponId);
    const requiredMats = lastWeapon.crafting.upgradeMaterials;
    const requiredMatsContainer = document.getElementById('requiredUpgradeMaterials');

    requiredMatsContainer.innerHTML = '';
    requiredMats.map((mat) => {

      let item = document.createElement("div");
      item.innerHTML = mat.item.name + " <strong>x" + mat.quantity + "</strong>";
      requiredMatsContainer.appendChild(item)

    });

    document.getElementById('lastWeapon').innerHTML = lastWeapon.name;
  }
}

let allPreviousWeapons = [];

async function getBaseWeapon(id) {
  const weapon = await getWeaponById(id);
  const isCraftable = weapon.crafting.craftable;

  const previousWeaponId = weapon.crafting.previous;

  if(isCraftable) {
    allPreviousWeapons.push(weapon.name);
    return weapon;
  }

  if(previousWeaponId) {
    const previousWeapon = await getWeaponById(previousWeaponId);
    allPreviousWeapons.push(weapon.name);
    allPreviousWeapons.push(previousWeapon.name);
    getBaseWeapon(previousWeapon.crafting.previous);
  }
}

async function getWeaponTree(array, id) {
  const weapon = await getWeaponById(id);
  const isCraftable = weapon.crafting.craftable;
  const previousWeaponId = weapon.crafting.previous;
  const currentWeaponTree = array;

  currentWeaponTree.push(weapon.name);

  if(isCraftable) {
    console.log(currentWeaponTree);
    return currentWeaponTree;
  }

  if(previousWeaponId) {
    const previousWeapon = await getWeaponById(previousWeaponId);
    return getWeaponTree(array, previousWeapon.id);
  }
}

async function displayWeaponTree(array,id) {
  const treeData = await getWeaponTree(array, id);
  const weapons = treeData.reverse();
  const weaponTreeEl = document.querySelector('.weapon-tree');
  weaponTreeEl.innerHTML = '';

  const ownedItemsInTree = checkTreeForInventoryItems(treeData);

  treeData.map(async (weapon,i) => {

    let item = document.createElement('div');
    let heading = document.createElement('div');
    let matContainer = document.createElement('ul');

    if(ownedItemsInTree.indexOf(weapon) > -1) {
      item.classList.add('owned');
      item.innerHTML = '<h4>' + weapon + ' <span>owned</span></h4>';
    } else {
      item.innerHTML = '<h4>' + weapon + '</h4>';
    }

    heading.innerHTML = 'Upgrade Requirements:';
    item.appendChild(heading);
    item.appendChild(matContainer);

    weaponTreeEl.appendChild(item)
    const weaponReqs = await getWeaponRequirementsByName(weapon);

    weaponReqs.map((mat) => {
      let matEl = document.createElement('li');
      matEl.innerHTML = mat.item.name + ' <strong>x' + mat.quantity + '</strong>';
      matContainer.appendChild(matEl);
    });
  });

}

function checkTreeForInventoryItems(weaponTree) {

  const inventory = localStorage.getItem('mhwInventory').split(',');
  const wishlist = localStorage.getItem('mhwWishlist').split(',');
  const matchedItems = [];

  inventory.sort();

  inventory.map((item) => {
    if(weaponTree.indexOf(item) > -1) {
      matchedItems.push(item);
    }
  });

  return matchedItems;
}

async function getAllWeapons() {
  const url = 'https://mhw-db.com/weapons';
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getAllWeaponNames() {

  const url = new URL('https://mhw-db.com/weapons ');

  url.searchParams.set('p', JSON.stringify({
    name: true
  }));

  const response = await fetch(url);
  const json = await response.json();
  return json;
};

function displaySelectedWeapon(weapon) {
  const el = document.getElementById('weapon');  
  el.innerHTML = weapon;
}

async function createWishlistAC() {

  const weaponNames = [];
  const weaponsResponse = await getAllWeaponNames();
  weaponsResponse.map((weapon) => {
    weaponNames.push(weapon.name);
  });

  new autoComplete({
    selector: 'input[name="addToWishlist"]',
    minChars: 3,
    source: async function(term, suggest) {
      const response = [];
      weaponNames.map((weaponName) => {
        if(weaponName.toLowerCase().indexOf(term) >= 0) {
          response.push(weaponName);
        }
      });
      suggest(response);
    },
    renderItem: function (item, search){
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
    },
    onSelect: function(e, term, item) {
      const weapon = term;
      addWeaponToWishlist(weapon);
    }
  });
}

async function createRequirementsAC() {

  const weaponNames = [];
  const weaponsResponse = await getAllWeaponNames();
  weaponsResponse.map((weapon) => {
    weaponNames.push(weapon.name);
  });

  new autoComplete({
    selector: 'input[name="weaponRequirementsInput"]',
    minChars: 3,
    source: async function(term, suggest) {
      const response = [];
      weaponNames.map((weaponName) => {
        if(weaponName.toLowerCase().indexOf(term) >= 0) {
          // push matching terms to response
          response.push(weaponName);
        }
      });
      suggest(response);
    },
    renderItem: function (item, search){
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
    },
    onSelect: async function(e, term, item) {
      const weaponName = term;
      displaySelectedWeapon(weaponName);
      displayWeaponRequirementsByName(weaponName);

      const weapon = await getWeaponByName(weaponName);
      const newWeaponTree = [];
      displayWeaponTree(newWeaponTree, weapon.id);
    }
  });
}

async function createInventoryAC() {

  const weaponNames = [];
  const weaponsResponse = await getAllWeaponNames();
  weaponsResponse.map((weapon) => {
    weaponNames.push(weapon.name);
  });

  new autoComplete({
    selector: 'input[name="addInventoryWeapon"]',
    minChars: 3,
    source: async function(term, suggest) {
      const response = [];
      weaponNames.map((weaponName) => {
        if(weaponName.toLowerCase().indexOf(term) >= 0) {
          // push matching terms to response
          response.push(weaponName);
        }
      });
      suggest(response);
    },
    renderItem: function (item, search){
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
    },
    onSelect: function(e, term, item) {
      const weapon = term;
      addWeaponToInventory(weapon);
    }
  });
}

setInventory();
setWishlist();
createWishlistAC();
createInventoryAC();
createRequirementsAC();
