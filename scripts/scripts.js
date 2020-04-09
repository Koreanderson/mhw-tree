const baseUrl = 'https://mhw-db.com';
const inventoryWeapons = [];

// Build Inventory Weapons

function addWeaponToInventory(weaponName) {
  inventoryWeapons.push(weaponName);
  updateWeaponInventoryDisplay();
}

function updateWeaponInventoryDisplay() {
  const inventoryContainer = document.getElementById('currentInventory');
  inventoryContainer.innerHTML = '';
  inventoryWeapons.map((weapon) => {
    let item = document.createElement("div");
    item.innerHTML = weapon;
    inventoryContainer.appendChild(item)
  });
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

  if(isCraftable) {
    currentWeaponTree.push(weapon.name);
    return currentWeaponTree;
  }

  if(previousWeaponId) {
    const previousWeapon = await getWeaponById(previousWeaponId);
    currentWeaponTree.push(weapon.name);
    currentWeaponTree.push(previousWeapon.name);
    return getWeaponTree(array, previousWeapon.crafting.previous);
  }
}

async function displayWeaponTree(array,id) {
  const treeData = await getWeaponTree(array, id);
  const weapons = treeData.reverse();
  const weaponTreeEl = document.querySelector('.weapon-tree');
  weaponTreeEl.innerHTML = '';

  treeData.map(async (weapon,i) => {
    let item = document.createElement('div');
    let heading = document.createElement('div');
    let matContainer = document.createElement('ul');
    heading.innerHTML = 'Upgrade Requirements:';
    item.innerHTML = '<h4>' + weapon + '</h4>';
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

// make class for autocomplete

async function handleAutoComplete() {

  // I need to abstract these variables and pass them as parameters instead to make this more versatile

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


async function handleInventoryAutoComplete() {

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

handleInventoryAutoComplete();
handleAutoComplete();
