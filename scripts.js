const baseUrl = 'https://mhw-db.com';
const weaponId =  783;

const inventoryWeaponArray = [780, 779];

const currentWeaponArray = [];

async function getWeaponById(id) {
  const url = baseUrl + '/weapons/' + id;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getWeaponTree(id) {
  const weapon = await getWeaponById(id);
  const lastWeaponId = weapon.crafting.previous;
  const lastWeapon = await getWeaponById(lastWeaponId);
  const requiredMats = lastWeapon.crafting.upgradeMaterials;
  const requiredMatsContainer = document.getElementById('requiredMaterials');

  document.getElementById('weapon').innerHTML = 'Current Weapon: ' + weapon.name;
  document.getElementById('lastWeapon').innerHTML = 'Last Weapon: ' + lastWeapon.name;

  requiredMats.map(function(mat) {

    let item = document.createElement("div");
    item.innerHTML = mat.quantity + "- " + mat.item.name;
    requiredMatsContainer.appendChild(item)

  });
}

async function getInventoryWeapons(inventoryWeaponIds) {
  const pWeaponIds = inventoryWeaponIds.map(async function(id) {
    const response = await getWeaponById(id);
    return response;
  });
  const inventoryWeapons = await Promise.all(pWeaponIds);
  console.log(inventoryWeapons);
}

getInventoryWeapons(inventoryWeaponArray);
getWeaponTree(weaponId);
