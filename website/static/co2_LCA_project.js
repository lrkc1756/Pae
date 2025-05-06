const DEFAULT_SUB_ITEMS = {
    'welding': [
    'floor assembly',
    'side parts', 
    'rear vehicle',
    'front vehicle',
    'roof structure',
    'door frames',
    'final assembly'
    ],
    'drying': [
    'preheating',
    'interim drying',
    'prime coat drying',
    'topcoat drying',
    'clear drying',
    'final drying',
    'cooling'
    ],
    'assembly of a car door': [
    'positioning and fixing',
    'welding in assembly',
    'bonding',
    'mechanical fastening',
    'sealing installation',
    'installation of electrical components'
    ]
};

function getUniqueName(baseName, existingNames) {
    let name = baseName;
    let counter = 1;
    while (existingNames.includes(name)) {
        name = `${baseName} ${counter++}`;
    }
    return name;
}

function getEnergyFactors() {
const factors = {};
userData.energyTypes.forEach(type => {
factors[type.name] = type.factor;
});
return factors;
}

function createDefaultSubItems(parentItem) {
const subList = document.createElement('ul');
subList.className = 'sub-list';
parentItem.appendChild(subList);
subItems.forEach(item => {
const subItem = createProjectItem(item, getNestingLevel(parentItem) + 1);
subList.appendChild(subItem);
});

subList.style.display = 'block';
}

function setupRenaming(element) {
element.addEventListener('dblclick', function(e) {
if (e.target.classList.contains('editable')) {
    startRenaming(e.target);
}
});
}

function startRenaming(nameElement) {
const input = document.createElement('input');
input.className = 'edit-input';
input.value = nameElement.textContent;

const originalDisplay = nameElement.style.display;
nameElement.style.display = 'none';
nameElement.parentElement.insertBefore(input, nameElement);

input.focus();

input.addEventListener('keyup', function(e) {
if (e.key === 'Enter') {
    finishRenaming(input, nameElement);
}
if (e.key === 'Escape') {
    cancelRenaming(input, nameElement, originalDisplay);
}
});

input.addEventListener('blur', function() {
finishRenaming(input, nameElement);
});
}

function finishRenaming(input, nameElement) {
const oldName = nameElement.textContent;
const newName = input.value;
nameElement.textContent = newName;
nameElement.style.display = 'block';
input.remove();

// 如果是项目重命名，更新userData
const item = nameElement.closest('.project-item');
const level = getNestingLevel(item);

if (level === 0) {
// 项目重命名
updateProjectName(oldName, newName);
} else if (level === 1) {
const projectItem = item.closest('#main-list > .project-item');
if (projectItem) {
    const projectName = projectItem.querySelector('.project-name').textContent;
    const subProjectName = newName;

    if (userData.projects[projectName] && 
        userData.projects[projectName][oldName]) {
        // 移动数据到新名称
        userData.projects[projectName][subProjectName] = 
            userData.projects[projectName][oldName];
        delete userData.projects[projectName][oldName];
        
        // 更新 projectData 中的引用
        for (const [key, value] of projectData.entries()) {
            if (key.includes(oldName)) {
                const newKey = key.replace(oldName, subProjectName);
                projectData.set(newKey, value);
                projectData.delete(key);
            }
        }

        DataManager.save();
    }
}
}else if (level === 2) {
    const subProjectItem = item.closest('.sub-list').parentElement;
    const projectItem = subProjectItem.closest('#main-list > .project-item');

    const projectName = projectItem.querySelector('.project-name').textContent;
    const subProjectName = subProjectItem.querySelector('.project-name').textContent;

    const processObj = userData.projects[projectName]?.[subProjectName]?.process;

    if (processObj && processObj[oldName]) {
        processObj[newName] = processObj[oldName];
        delete processObj[oldName];
    }
}
DataManager.save();
}

function updateProjectName(oldName, newName) {
if (oldName !== newName && userData.projects[oldName]) {
userData.projects[newName] = userData.projects[oldName];
delete userData.projects[oldName];

for (const [key, value] of projectData.entries()) {
    if (key.startsWith(oldName)) {
        const newKey = key.replace(oldName, newName);
        projectData.set(newKey, value);
        projectData.delete(key);
    }
}
}
DataManager.save();
}

function addNewSubProject(projectName, subProjectName) {
if (!userData.projects[projectName]) {
userData.projects[projectName] = {};
}
if (!userData.projects[projectName][subProjectName]) {
    // 默认结构
    userData.projects[projectName][subProjectName] = {
        materials:{
            materials: [],
            rawMaterials: [],
            additionalMaterials: []
        },
        process: {}
    };
}
DataManager.save();
}

function createNestedItemsFromDefault(parentItem, projectData) {
    const subList = document.createElement('ul');
    subList.className = 'sub-list';
    subList.style.display = 'block';
    parentItem.appendChild(subList);

    for (const subprojectName in projectData) {
        const subprojectData = projectData[subprojectName];
        const subItem = createProjectItem(subprojectName, 1);
        subList.appendChild(subItem);

        const subSubList = document.createElement('ul');
        subSubList.className = 'sub-list';
        subSubList.style.display = 'none';
        subItem.appendChild(subSubList);

        // 处理默认的process数据
        if (subprojectData.process) {
            for (const processName in subprojectData.process) {
                const subSubItem = createProjectItem(processName, 2);
                subSubList.appendChild(subSubItem);
            }
        }
        
        // 同时保留原有的默认子子项目
        const defaultSubItems = DEFAULT_SUB_ITEMS[subprojectName.toLowerCase()];
        if (defaultSubItems) {
            defaultSubItems.forEach(subSubProjectName => {
                // 检查是否已存在同名process
                if (!subprojectData.process || !subprojectData.process[subSubProjectName]) {
                    const subSubItem = createProjectItem(subSubProjectName, 2);
                    subSubList.appendChild(subSubItem);
                }
            });
        }
    }
}

function createNestedStructureFromData(parentItem, projectData) {
    const subList = document.createElement('ul');
    subList.className = 'sub-list';
    parentItem.appendChild(subList);
  
    // 遍历子项目 (welding/drying/assembly)
    Object.keys(projectData).forEach(subprojectName => {
      const subprojectData = projectData[subprojectName];
      const subItem = createProjectItem(subprojectName, 1);
      subList.appendChild(subItem);
  
      // 创建子子项目容器
      const subSubList = document.createElement('ul');
      subSubList.className = 'sub-list';
      subItem.appendChild(subSubList);
  
      // 添加process项目
      if (subprojectData.process) {
        Object.keys(subprojectData.process).forEach(processName => {
          const subSubItem = createProjectItem(processName, 2);
          subSubList.appendChild(subSubItem);
        });
      }
      subSubList.style.display = 'none';
    });
    
    subList.style.display = 'block';
  }

function createProjectItem(name, level = 0) {
// 创建项目列表项
// 这里的 level 用于确定项目的嵌套级别
// 0: 主项目, 1: 子项目, 2: 子子项目
const li = document.createElement('li');
li.className = 'project-item';
li.dataset.projectId = crypto.randomUUID();

const div = document.createElement('div');
div.className = 'project-content';

const nameSpan = document.createElement('span');
nameSpan.className = 'project-name editable';
nameSpan.textContent = name;
setupRenaming(nameSpan);

// Create a button container
const buttonsDiv = document.createElement('div');
buttonsDiv.className = 'project-buttons';

if (level < 2) {
const addBtn = document.createElement('button');
addBtn.className = 'btn add-btn';
addBtn.textContent = '+';
buttonsDiv.appendChild(addBtn);
}

const deleteBtn = document.createElement('button');
deleteBtn.className = 'btn delete-btn';
deleteBtn.textContent = '×';
buttonsDiv.appendChild(deleteBtn);

div.appendChild(nameSpan);
div.appendChild(buttonsDiv);
li.appendChild(div);

return li;
}

function getNestingLevel(item) {
let level = 0;
let parentList = item.closest('.sub-list');
while (parentList) {
level++;
parentList = parentList.parentElement.closest('.sub-list');
}
return level;
}

// 获取当前项目的waste数据
function getWasteData(projectName, subProjectName) {
// 获取当前项目和子项目名称
if (!userData.projects[projectName]) {
userData.projects[projectName] = {};
}
if (!userData.projects[projectName][subProjectName]) {
// 根据子项目类型初始化默认数据
if (subProjectName.toLowerCase().includes('welding')) {
    userData.projects[projectName][subProjectName] = 
        JSON.parse(JSON.stringify(defaultData.projects["Example Project"].welding));
} else if (subProjectName.toLowerCase().includes('drying')) {
    userData.projects[projectName][subProjectName] = 
        JSON.parse(JSON.stringify(defaultData.projects["Example Project"].drying));
} else if (subProjectName.toLowerCase().includes('assembly')) {
    userData.projects[projectName][subProjectName] = 
        JSON.parse(JSON.stringify(defaultData.projects["Example Project"]["assembly of a car door"]));
} else {
    // 默认结构
    userData.projects[projectName][subProjectName] = {
        materials:{
            materials: [],
            rawMaterials: [],
            additionalMaterials: []
        },
        process: {}
    };
}
}
return userData.projects[projectName][subProjectName];
}

function addCustomEnergyType() {
    const nameInput = document.getElementById('new-energy-type');
    const factorInput = document.getElementById('new-energy-factor');
    const errorElement = document.getElementById('energy-factor-error');

    if (!validateEnergyFactor()) {
        return;
    }
    
    const name = nameInput.value.trim();
    const factor = parseFloat(factorInput.value);

    if (userData.energyTypes.some(type => type.name === name)) {
        errorElement.textContent = "This energy type already exists";
        nameInput.style.borderColor = "red";
        return;
    }
    
    nameInput.style.borderColor = "";
    factorInput.style.borderColor = "";
    errorElement.textContent = "";
    
    if (!name) {
    errorElement.textContent = "Please enter an energy type name";
    nameInput.style.borderColor = "red";
    return;
    }
    
    if (isNaN(factor)) {
    errorElement.textContent = "Please enter a valid number for the energy factor";
    factorInput.style.borderColor = "red";
    return;
    }
    
    if (factor < 0) {
    errorElement.textContent = "Please enter a non-negative number for the energy factor";
    factorInput.style.borderColor = "red";
    return;
    }
    
    const exists = userData.energyTypes.some(type => type.name === name);
    if (exists) {
    errorElement.textContent = "This energy type already exists";
    nameInput.style.borderColor = "red";
    return;
    }
    
    // 添加到 userData.energyTypes
    userData.energyTypes.push({ name, factor });
    DataManager.save();
    
    // 更新下拉菜单
    const select = document.getElementById('energy-type');
    select.innerHTML = '';
    userData.energyTypes.forEach(type => {
        const option = new Option(`${type.name} (${type.factor} g CO2/kWh)`, type.name);
        select.add(option);
    });
    select.value = name;
    
    // 清空输入
    nameInput.value = '';
    factorInput.value = '';
    errorElement.textContent = "";
}
    

document.addEventListener('DOMContentLoaded', () => {
userData = DataManager.load();
const exampleProject = document.getElementById('example-project');
createNestedItemsFromDefault(exampleProject, defaultData.projects["Example Project"]);

const exampleSubList = exampleProject.querySelector('.sub-list');
if (exampleSubList) {
exampleSubList.style.display = 'block';
}
updateAllProjectsTotal();
DataManager.save();

const contentArea = document.getElementById('content-area');
const imageContainer = document.querySelector('.image-container');
if (imageContainer && contentArea) {
contentArea.appendChild(imageContainer);
}
});

document.getElementById('add-main-btn').addEventListener('click', function() {
    const existingProjectNames = Object.keys(userData.projects);
    const projectName = getUniqueName("New Project", existingProjectNames);

    userData.projects[projectName] = JSON.parse(JSON.stringify(defaultData.projects["Example Project"]));
    
    const newItem = createProjectItem(projectName, 0);
    document.getElementById('main-list').appendChild(newItem);
    
    createNestedStructureFromData(newItem, userData.projects[projectName]);
    
    DataManager.save();
    updateAllProjectsTotal();
  });

document.getElementById('manage-data-btn')?.addEventListener('click', function () {
    DataManager.save();
    showDataManager();
  });

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-btn')) {
        const parentItem = e.target.closest('.project-item');
        const currentLevel = getNestingLevel(parentItem);
        let newItemName = "New Production Process";
        if (currentLevel >= 2) return;

        let subList = parentItem.querySelector('.sub-list');
        if (!subList) {
            subList = document.createElement('ul');
            subList.className = 'sub-list';
            parentItem.appendChild(subList);
        }

        if (currentLevel === 0) {
            const projectName = parentItem.querySelector('.project-name').textContent;
            const existingSubProjectNames = Object.keys(userData.projects[projectName] || {});
            const uniqueSubProjectName = getUniqueName(newItemName, existingSubProjectNames);

            // 确保项目存在
            if (!userData.projects[projectName]) {
                userData.projects[projectName] = {};
            }

            // 添加子项目 - 直接使用带空格的名称
            if (!userData.projects[projectName][uniqueSubProjectName]) {
                userData.projects[projectName][uniqueSubProjectName] = {
                    materials:{
                        materials: [],
                        rawMaterials: [],
                        additionalMaterials: []
                    },
                    process: {}
                };

                const newItem = createProjectItem(uniqueSubProjectName, currentLevel + 1);
                subList.appendChild(newItem);
                subList.style.display = 'block';
            }
        } else if (currentLevel === 1) {
            const projectItem = parentItem.closest('#main-list > .project-item');
            const projectName = projectItem.querySelector('.project-name').textContent;
            const subProjectName = parentItem.querySelector('.project-name').textContent;

            const process = userData.projects[projectName][subProjectName].process || {};
            const existingSubSubProjectNames = Object.keys(process);
            const uniqueProcessName = getUniqueName(newItemName, existingSubSubProjectNames);

            if (!userData.projects[projectName][subProjectName].process) {
                userData.projects[projectName][subProjectName].process = {};
            }

            userData.projects[projectName][subProjectName].process[uniqueProcessName] = {
                energyType: "",
                energy: 0,
                materials: "",
                materialsQuantity: 0,
                rawMaterials: "",
                rawMaterialsQuantity: 0,
                additionalMaterials: "",
                additionalMaterialsQuantity: 0
            };

            const newItem = createProjectItem(uniqueProcessName, currentLevel + 1);
            subList.appendChild(newItem);
            subList.style.display = 'block';
        }
    DataManager.save();
    }

    if (e.target.classList.contains('delete-btn')) {
    const itemToDelete = e.target.closest('.project-item');
    const level = getNestingLevel(itemToDelete);

    // 获取项目名称
    const itemName = itemToDelete.querySelector('.project-name').textContent;

    if (level === 0) {
        // 删除主项目
        delete userData.projects[itemName];
    } else if (level === 1) {
        // 删除子项目
        const parentProjectItem = itemToDelete.closest('#main-list > .project-item');
        if (parentProjectItem) {
            const projectName = parentProjectItem.querySelector('.project-name').textContent;
            if (userData.projects[projectName] && 
                userData.projects[projectName][itemName]) {
                delete userData.projects[projectName][itemName];
            }
        }
            
    } else if (level === 2) {
        // 删除子子项目
        const subProjectItem = itemToDelete.closest('.sub-list').parentElement;
        const projectItem = subProjectItem.closest('#main-list > .project-item');
        
        const projectName = projectItem.querySelector('.project-name').textContent;
        const subProjectName = subProjectItem.querySelector('.project-name').textContent;
        
        const processObj = userData.projects[projectName]?.[subProjectName]?.process;
        
        if (processObj && processObj[itemName]) {
            delete processObj[itemName];
        }
    }

    // 清理 projectData Map 中的相关数据
    const keysToDelete = [];
    for (const key of projectData.entries()) {
        if (key.startsWith(itemToDelete.dataset.projectId)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => projectData.delete(key));

    itemToDelete.remove();
    DataManager.save();
    // 延迟更新总排放量，确保DOM操作完成
    setTimeout(() => {
        updateAllProjectsTotal();

        // 如果删除的是当前选中的项目，清空内容区域
        if (itemToDelete.classList.contains('selected')) {
            document.getElementById('input-section').innerHTML = '';
            document.getElementById('output-section').innerHTML = '';
            document.getElementById('selected-project').textContent = '';
        }
    }, 0);
    }
});


setupRenaming(document.querySelector('.project-name'));
const projectData = new Map();
let currentSubSubItem = null;

document.addEventListener('click', function(e) {
if (e.target.closest('.project-item')) {
const item = e.target.closest('.project-item');
const level = getNestingLevel(item);

if (e.target.classList.contains('project-name')) {
    const subList = item.querySelector('.sub-list');
    if (subList) {
        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
    }
    return;
}

document.querySelectorAll('.project-item').forEach(i => i.classList.remove('selected'));
item.classList.add('selected');
document.getElementById('selected-project').textContent = item.querySelector('.project-name').textContent;

if (level === 2) {
    currentSubSubItem = item;
    showInputForm(item);

    const parentProject = item.parentElement.parentElement.parentElement;
    const parentProcess = item.parentElement.parentElement;

    const dataKey = `${parentProject.dataset.projectId}-${parentProcess.dataset.projectId}-${item.dataset.projectId}`;

    if (projectData.has(dataKey)) {
        showTotalEmissions(item, level);
        showCurrentEmission(projectData.get(dataKey));
    } else {
        document.getElementById('output-section').innerHTML = '';
    }
} else {
    currentSubSubItem = null;
    showTotalEmissions(item, level);
}
}
});

function setupDisableQuantityOnNoSelection() {
    const pairs = [
        { selectId: 'materials', inputId: 'materials-quantity' },
        { selectId: 'raw-materials', inputId: 'raw-materials-quantity' },
        { selectId: 'additional-materials', inputId: 'additional-materials-quantity' }
    ];

    pairs.forEach(({ selectId, inputId }) => {
        const selectEl = document.getElementById(selectId);
        const inputEl = document.getElementById(inputId);

        if (selectEl && inputEl) {
            const updateInputState = () => {
                if (selectEl.value === 'no' || selectEl.value === '') {
                    inputEl.disabled = true;
                    inputEl.value = '';
                    inputEl.style.borderColor = "";
                    const errEl = document.getElementById(`${inputId}-error`);
                    if (errEl) errEl.textContent = '';
                } else {
                    inputEl.disabled = false;
                }
            };

            updateInputState();
            
            selectEl.addEventListener('change', updateInputState);
        }
    });
}


function showInputForm(item) {
    const parentNameElement = item.parentElement.parentElement.querySelector('.project-name');
    const parentName = parentNameElement ? parentNameElement.textContent.toLowerCase() : '';
    const currentItemName = item.querySelector('.project-name').textContent.toLowerCase();
    const inputSection = document.getElementById('input-section');
    inputSection.innerHTML = '';

    // Check if this is a default sub-item (level 2 and name is in DEFAULT_SUB_ITEMS)
    const isDefaultSubItem = () => {
    const level = getNestingLevel(item);
    if (level !== 2) return false;

    // Check all default sub-items arrays
    for (const key in DEFAULT_SUB_ITEMS) {
        if (DEFAULT_SUB_ITEMS[key].some(subItem => 
            subItem.toLowerCase() === currentItemName)) {
            return true;
        }
    }
    return false;
    };

    // Rest of the energy type group and energy input group code remains the same...
    const energyTypeGroup = document.createElement('div');
    energyTypeGroup.className = 'input-group';
    energyTypeGroup.innerHTML = '<label>Energy Type:</label>';

    const energyTypeSelect = document.createElement('select');
    energyTypeSelect.id = 'energy-type';
    userData.energyTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type.name;
    option.textContent = `${type.name} (${type.factor} g CO2/kWh)`;
    energyTypeSelect.appendChild(option);
    });
    energyTypeGroup.appendChild(energyTypeSelect);

    energyTypeGroup.innerHTML += `
    <div style="margin-top: 5px;">
        <div class="custom-input-container">
            <input type="text" class="custom-input" id="new-energy-type" placeholder="Energy type name">
            <input type="number" class="custom-input" id="new-energy-factor" placeholder="Factor (g CO2/kWh)" step="0.1">
            <button class="add-custom-btn" onclick="addCustomEnergyType()">+</button>
        </div>
        <div class="error" id="energy-factor-error" style="margin-top: 5px;"></div>
    </div>
    `;

    const energyInputGroup = document.createElement('div');
    energyInputGroup.className = 'input-group';
    energyInputGroup.innerHTML = `
    <label>Energy (kWh):</label>
    <input type="number" id="energy-input" step="0.1">
    <div class="error" id="energy-error"></div>
    `;

    inputSection.appendChild(energyTypeGroup);
    inputSection.appendChild(energyInputGroup);

    // Add calculate and next buttons at the bottom
    const siblings = Array.from(item.parentElement.children);
    const isLast = siblings.indexOf(item) === siblings.length - 1;

    const buttonGroup = document.createElement('div');
    buttonGroup.style.marginTop = '15px';
    buttonGroup.innerHTML = `
    <button id="calculate-btn" class="btn">Calculate</button>
    ${!isLast ? `<button id="next-btn" class="btn" style="margin-left: 10px;">Next</button>` : ''}
    `;

    inputSection.appendChild(buttonGroup);


    if (parentName.includes('welding')) {
    addMaterialSection('materials', 0);
    addMaterialSection('raw-materials', 0);
    } 
    else if (parentName.includes('door')) {
    addMaterialSection('raw-materials', 0);
    addMaterialSection('additional-materials', 0);
    }

    setupInputValidation();

    // Only show material selector for non-default sub-items
    if (!isDefaultSubItem()) {
    // Add material selector section in one line
    const materialSelectorGroup = document.createElement('div');
    materialSelectorGroup.className = 'input-group';
    materialSelectorGroup.innerHTML = `
        <div><label>Add Material Section:</label></div>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
            <select id="material-type-selector" style="flex: 1;">
                <option value="">Select material type...</option>
                <option value="materials">Materials</option>
                <option value="raw-materials">Raw Materials</option>
                <option value="additional-materials">Additional Materials</option>
            </select>
            <button class="add-custom-btn" onclick="addSelectedMaterialSection()">+</button>
        </div>
        <div class="error" id="material-section-error" style="color: red; margin-top: 5px;"></div>
    `;
    inputSection.insertBefore(materialSelectorGroup, buttonGroup);
    }

    const projectName = item.closest('#main-list > .project-item').querySelector('.project-name').textContent;
    const subProjectItem = item.closest('.sub-list').parentElement;
    const subProjectName = subProjectItem.querySelector('.project-name').textContent;
    const subSubProjectName = item.querySelector('.project-name').textContent;

    const savedData = userData.projects[projectName]?.[subProjectName]?.process?.[subSubProjectName];

    if (savedData) {
        document.getElementById('energy-type').value = savedData.energyType || 'Fossil';
        document.getElementById('energy-input').value = savedData.energy || '';

        if (savedData.materials !== undefined && savedData.materials !== '') {
            addMaterialSection('materials');
            document.getElementById('materials').value = savedData.materials || 'no';
            document.getElementById('materials-quantity').value = savedData.materialsQuantity || '';
        }

        if (savedData.rawMaterials !== undefined && savedData.rawMaterials !== '') {
            addMaterialSection('raw-materials');
            document.getElementById('raw-materials').value = savedData.rawMaterials || 'no';
            document.getElementById('raw-materials-quantity').value = savedData.rawMaterialsQuantity || '';
        }

        if (savedData.additionalMaterials !== undefined && savedData.additionalMaterials !== '') {
            addMaterialSection('additional-materials');
            document.getElementById('additional-materials').value = savedData.additionalMaterials || 'no';
            document.getElementById('additional-materials-quantity').value = savedData.additionalMaterialsQuantity || '';
        }

        showCurrentEmission(savedData);
    } else {
        // 默认初始化
        document.getElementById('energy-type').value = 'Fossil';
        document.getElementById('energy-input').value = '';
    }

    setupDisableQuantityOnNoSelection();
    setupInputValidation(); // 只需要调用这个函数，它会设置所有验证逻辑
}


function addSelectedMaterialSection() {
const selector = document.getElementById('material-type-selector');
const selectedType = selector.value;
const errorElement = document.getElementById('material-section-error');

// 清除之前的错误提示
errorElement.textContent = '';

if (!selectedType) {
errorElement.textContent = "Please select a material type";
return;
}

// 检查是否已存在相同类型的材料部分
const existingSection = document.getElementById(`${selectedType}-section`);
if (existingSection) {
errorElement.textContent = `"${selectedType}" section already exists`;
return;
}

// 如果通过检查，添加新材料部分
addMaterialSection(selectedType);
DataManager.save();
selector.value = ''; // 重置选择器
}

function toCamelCase(type) {
return type.split('-').map((part, i) =>
i === 0 ? part : part[0].toUpperCase() + part.slice(1)
).join('');
}


function addMaterialSection(type, mode = 1) {
    const inputSection = document.getElementById('input-section');
    const existingSection = document.getElementById(`${type}-section`);
    const buttonGroup = inputSection.querySelector('div:has(#calculate-btn)');    

    if (existingSection) return; // 如果已存在，不再添加

    // 获取当前项目和子项目名称
    const projectItem = currentSubSubItem || document.querySelector('.project-item.selected');
    const projectName = projectItem.closest('#main-list > .project-item')?.querySelector('.project-name').textContent || 'New Project';
    const subProjectItem = projectItem.closest('.sub-list').parentElement;
    const subProjectName = subProjectItem.querySelector('.project-name')?.textContent || 'New Sub Project';


    // 获取对应的 wasteData（优先使用 userData，否则用 defaultData）
    const wasteData = userData.projects[projectName]?.[subProjectName]?.materials || 
                 defaultData.projects["Example Project"][subProjectName.toLowerCase()] || {
                     materials: [],
                     rawMaterials: [],
                     additionalMaterials: []
                 };
             
    // 创建完整的 HTML 结构
    let html = '';
    if (type === 'materials') {
    html = `
        <div class="material-section" id="materials-section">
            <div class="input-group">
                <label>Materials:</label>
                <select id="materials"></select>
            </div>
            <div class="input-group">
                <label>Materials Quantity:</label>
                <input type="text" id="materials-quantity" placeholder="Enter quantity">
                <div class="error" id="materials-quantity-error"></div>
            </div>
            ${mode === 1 ? `<button class="remove-section-btn" onclick="removeMaterialSection(this)">Remove</button>` : ''}
        </div>
    `;
    } else if (type === 'raw-materials') {
    html = `
        <div class="material-section" id="raw-materials-section">
            <div class="input-group">
                <label>Raw Materials:</label>
                <select id="raw-materials"></select>
            </div>
            <div class="input-group">
                <label>Raw Materials Quantity:</label>
                <input type="text" id="raw-materials-quantity" placeholder="Enter quantity">
                <div class="error" id="raw-materials-quantity-error"></div>
            </div>
            ${mode === 1 ? `<button class="remove-section-btn" onclick="removeMaterialSection(this)">Remove</button>` : ''}
        </div>
    `;
    } else if (type === 'additional-materials') {
    html = `
        <div class="material-section" id="additional-materials-section">
            <div class="input-group">
                <label>Additional Materials:</label>
                <select id="additional-materials"></select>
            </div>
            <div class="input-group">
                <label>Additional Materials Quantity:</label>
                <input type="text" id="additional-materials-quantity" placeholder="Enter quantity">
                <div class="error" id="additional-materials-quantity-error"></div>
            </div>
            ${mode === 1 ? `<button class="remove-section-btn" onclick="removeMaterialSection(this)">Remove</button>` : ''}
        </div>
    `;
    }

    // 插入到按钮组之前
    buttonGroup.insertAdjacentHTML('beforebegin', html);

    // 填充下拉菜单选项
    const materialType = toCamelCase(type);
    const materials = Array.isArray(wasteData[materialType]) 
        ? wasteData[materialType] 
        : [];

    const select = document.getElementById(type);
    if (select) {
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = 'no';
        defaultOption.textContent = 'no';
        select.appendChild(defaultOption);
        materials.forEach(material => {
            const option = document.createElement('option');
            option.value = material.name;
            option.textContent = material.name;
            select.appendChild(option);
        });

        select.value = 'no';
    }

    // 设置数量输入的禁用状态
    setupDisableQuantityOnNoSelection();
    setupInputValidation();

}

function removeMaterialSection(button) {
const section = button.closest('.material-section');
if (!section) return;

const sectionId = section.id.replace('-section', '');
const camelCaseType = toCamelCase(sectionId);

// 获取当前项目和子项目
const projectItem = currentSubSubItem || document.querySelector('.project-item.selected');
const projectName = projectItem.closest('#main-list > .project-item')?.querySelector('.project-name').textContent;
const subProjectItem = projectItem.closest('.sub-list').parentElement;
const subProjectName = subProjectItem.querySelector('.project-name')?.textContent;

// 从数据中移除该材料部分
if (userData.projects[projectName]?.[subProjectName]?.[camelCaseType]) {
userData.projects[projectName][subProjectName][camelCaseType] = [];
}

// 从DOM中移除
section.remove();

// 保存更改
DataManager.save();
}

function validateMaterialQuantity(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    const selectId = inputId.replace('-quantity', '');
    const select = document.getElementById(selectId);

    if (!input || !error || !select) {
        console.error(`Validation failed: Missing elements for ${inputId}`);
        return false;
    }

    // 如果未选择材料（选择"no"），则禁用输入并清除错误
    if (select.value === 'no') {
        input.disabled = true;
        input.value = '';
        error.textContent = "";
        input.style.borderColor = "";
        return true;
    }
    input.disabled = false;
    // 如果选择了材料，则进行验证
    const value = input.value.trim();
    if (value === '') {
        // 允许空值（用户可能还未输入）
        error.textContent = "";
        input.style.borderColor = "";
        return true;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        error.textContent = "Please enter a valid number";
        input.style.borderColor = "red";
        return false;
    } else if (numValue < 0) {
        error.textContent = "Quantity must be non-negative";
        input.style.borderColor = "red";
        return false;
    } else {
        error.textContent = "";
        input.style.borderColor = "";
        return true;
    }
}

function validateEnergyFactor() {
    const factorInput = document.getElementById('new-energy-factor');
    const errorElement = document.getElementById('energy-factor-error');
    const value = parseFloat(factorInput.value);

    if (isNaN(value)) {
        errorElement.textContent = "Please enter a valid number";
        factorInput.style.borderColor = "red";
        return false;
    } else if (value < 0) {
        errorElement.textContent = "Factor must be non-negative";
        factorInput.style.borderColor = "red";
        return false;
    } else {
        errorElement.textContent = "";
        factorInput.style.borderColor = "";
        return true;
    }
}

function validateEnergyInput() {
    const energyInput = document.getElementById('energy-input');
    const energyError = document.getElementById('energy-error');
    const value = parseFloat(energyInput.value);
    
    if (isNaN(value)) {
        energyError.textContent = "Please enter a valid number";
        energyInput.style.borderColor = "red";
        return false;
    } else if (value < 0) {
        energyError.textContent = "Energy value must be non-negative";
        energyInput.style.borderColor = "red";
        return false;
    } else {
        energyError.textContent = "";
        energyInput.style.borderColor = "";
        return true;
    }
}

function setupInputValidation() {
    // Setup event listeners
    const energyInput = document.getElementById('energy-input');
    if (energyInput) {
        energyInput.addEventListener('input', validateEnergyInput);
        energyInput.addEventListener('change', validateEnergyInput);
    }

    const energyFactorInput = document.getElementById('new-energy-factor');
    if (energyFactorInput) {
        energyFactorInput.addEventListener('input', validateEnergyFactor);
        energyFactorInput.addEventListener('change', validateEnergyFactor);
    }

    ['materials', 'raw-materials', 'additional-materials'].forEach(type => {
        const quantityInput = document.getElementById(`${type}-quantity`);
        const select = document.getElementById(type);

        if (quantityInput && select) {
            // 当选择变化时，验证数量
            select.addEventListener('change', () => {
                validateMaterialQuantity(`${type}-quantity`, `${type}-quantity-error`);
            });

            // 当数量输入变化时，验证
            quantityInput.addEventListener('input', () => {
                validateMaterialQuantity(`${type}-quantity`, `${type}-quantity-error`);
            });

            quantityInput.addEventListener('change', () => {
                validateMaterialQuantity(`${type}-quantity`, `${type}-quantity-error`);
            });
        }
    });
}

document.addEventListener('click', function(e) {
    if (e.target.id === 'calculate-btn') {
        const isValidEnergy = validateEnergyInput();
        let isValidMaterials = true;
        let isValidRawMaterials = true;
        let isValidAdditionalMaterials = true;

        if (document.getElementById('materials-section')) {
            isValidMaterials = validateMaterialQuantity('materials-quantity', 'materials-quantity-error');
        }
        if (document.getElementById('raw-materials-section')) {
            isValidRawMaterials = validateMaterialQuantity('raw-materials-quantity', 'raw-materials-quantity-error');
        }
        if (document.getElementById('additional-materials-section')) {
            isValidAdditionalMaterials = validateMaterialQuantity('additional-materials-quantity', 'additional-materials-quantity-error');
        }
        if (isValidEnergy && isValidMaterials && isValidRawMaterials && isValidAdditionalMaterials) {
            calculateEmissions();
        }
    }
});


function calculateEmissions() {
const energyType = document.getElementById('energy-type').value;
const energy = parseFloat(document.getElementById('energy-input').value);

const parentProject = currentSubSubItem.parentElement.parentElement.parentElement;
const parentProcess = currentSubSubItem.parentElement.parentElement;
const dataKey = `${parentProject.dataset.projectId}-${parentProcess.dataset.projectId}-${currentSubSubItem.dataset.projectId}`;

// 获取工艺类型
const processType = parentProcess.querySelector('.project-name').textContent.toLowerCase();

const energyFactor = userData.energyTypes.find(type => type.name === energyType)?.factor || 0;
// 初始化排放数据对象
const emissionData = {
energyType,
energy,
CO2: energy * energyFactor,
timestamp: new Date().toISOString()
};

// 获取材料选择数据
const materials = document.getElementById('materials')?.value === 'no' ? "" : document.getElementById('materials')?.value || "";
const rawMaterials = document.getElementById('raw-materials')?.value === 'no' ? "" : document.getElementById('raw-materials')?.value || "";
const additionalMaterials = document.getElementById('additional-materials')?.value === 'no' ? "" : document.getElementById('additional-materials')?.value || "";

// 获取材料数量数据
const materialsQuantity = parseFloat(document.getElementById('materials-quantity')?.value) || 0;
const rawMaterialsQuantity = parseFloat(document.getElementById('raw-materials-quantity')?.value) || 0;
const additionalMaterialsQuantity = parseFloat(document.getElementById('additional-materials-quantity')?.value) || 0;

const projectName = currentSubSubItem.closest('#main-list > .project-item').querySelector('.project-name').textContent;
const subProjectItem = currentSubSubItem.closest('.sub-list').parentElement;
const subProjectName = subProjectItem.querySelector('.project-name').textContent;
const subSubProjectName = currentSubSubItem.querySelector('.project-name').textContent;

// 计算各种材料的废弃物
if (materials && materials !== 'no' && !isNaN(materialsQuantity)) {
const materialWaste = calculateWaste(processType, 'materials', materials, materialsQuantity);
if (materialWaste) {
    emissionData.materialWaste = materialWaste;
    emissionData.materials = materials; // 保存材料名称
    emissionData.materialsQuantity = materialsQuantity; // 保存材料数量
}
}

if (rawMaterials && rawMaterials !== 'no' && !isNaN(rawMaterialsQuantity)) {
const rawMaterialWaste = calculateWaste(processType, 'rawMaterials', rawMaterials, rawMaterialsQuantity);
if (rawMaterialWaste) {
    emissionData.rawMaterialWaste = rawMaterialWaste;
    emissionData.rawMaterials = rawMaterials;
    emissionData.rawMaterialsQuantity = rawMaterialsQuantity;
}
}

if (additionalMaterials && additionalMaterials !== 'no' && !isNaN(additionalMaterialsQuantity)) {
const additionalMaterialWaste = calculateWaste(processType, 'additionalMaterials', additionalMaterials, additionalMaterialsQuantity);
if (additionalMaterialWaste) {
    emissionData.additionalMaterialWaste = additionalMaterialWaste;
    emissionData.additionalMaterials = additionalMaterials;
    emissionData.additionalMaterialsQuantity = additionalMaterialsQuantity;
}
}

const subSubData = {
  energyType,
  energy,
  materials,
  materialsQuantity,
  rawMaterials,
  rawMaterialsQuantity,
  additionalMaterials,
  additionalMaterialsQuantity
};
// 保存数据
userData.projects[projectName][subProjectName].process[subSubProjectName] = subSubData;
DataManager.save();

projectData.set(dataKey, emissionData);
console.log('Emission data saved:', emissionData); // 调试日志

// 显示当前排放数据
showCurrentEmission(emissionData);
updateParentEmissions();
updateAllProjectsTotal();
}

function calculateWaste(processType, materialType, materialName, quantity) {
// 获取项目名称和子项目名称
const projectName = currentSubSubItem.closest('#main-list > .project-item')?.querySelector('.project-name').textContent || 'New Project';
const subProjectName = currentSubSubItem.closest('.sub-list').parentElement.querySelector('.project-name')?.textContent || 'New Sub Project';

const processData = userData.projects[projectName]?.[subProjectName] || 
               defaultData.projects["Example Project"][subProjectName.toLowerCase()];

if (!processData) {
console.error('Process data not found for:', projectName, subProjectName);
return null;
}

const materials = Array.isArray(processData.materials?.[materialType]) 
    ? processData.materials[materialType] 
    : [];
    
if (!materials.length) {
    console.error('No materials found for type:', materialType);
    return null;
}

// 查找匹配的材料数据 - 直接使用原始名称比较
const material = materials.find(m => m.name === materialName.toLowerCase());

if (!material) {
console.error('Material not found:', materialName, 'in', materials);
return null;
}

console.log('Found material:', material);

// 计算废弃物量 = 数量 × 废弃因子
return {
amount: quantity * material.wasteFactor,
types: material.wasteType,
unit: material.unit
}
};

function showCurrentEmission(data) {
const outputSection = document.getElementById('output-section');
let html = `<h3>Current emissions data</h3>`;

html += `<p>CO₂: ${(data.CO2 || 0).toFixed(2)} g</p>`;

if(data.shieldingGas) {
html += `<p>Shielding Gas: ${data.shieldingGas.toFixed(2)} g</p>`;
}
if(data.weldingFume) {
html += `<p>Welding Fume: ${data.weldingFume.toFixed(2)} g</p>`;
}

if (data.materialWaste) {
html += `<h4>Material Waste (${data.materials})</h4>`;
html += `<p>Amount: ${data.materialWaste.amount.toFixed(4)} ${data.materialWaste.unit}</p>`;
html += `<p>Types: ${data.materialWaste.types.join(', ')}</p>`;
html += `<p>Quantity: ${data.materialsQuantity || 0}</p>`;
}

if (data.rawMaterialWaste) {
html += `<h4>Raw Material Waste (${data.rawMaterials})</h4>`;
html += `<p>Amount: ${data.rawMaterialWaste.amount.toFixed(4)} ${data.rawMaterialWaste.unit}</p>`;
html += `<p>Types: ${data.rawMaterialWaste.types.join(', ')}</p>`;
html += `<p>Quantity: ${data.rawMaterialsQuantity || 0}</p>`;
}

if (data.additionalMaterialWaste) {
html += `<h4>Additional Material Waste (${data.additionalMaterials})</h4>`;
html += `<p>Amount: ${data.additionalMaterialWaste.amount.toFixed(4)} ${data.additionalMaterialWaste.unit}</p>`;
html += `<p>Types: ${data.additionalMaterialWaste.types.join(', ')}</p>`;
html += `<p>Quantity: ${data.additionalMaterialsQuantity || 0}</p>`;
}

outputSection.innerHTML = html;
}

function showTotalEmissions(item, level) {
const inputSection = document.getElementById('input-section');
const outputSection = document.getElementById('output-section');
inputSection.innerHTML = '';

const total = calculateTotalEmissions(item);

let title = '';
if (level === 0) {
title = 'Total project emissions';
} else if (level === 1) {
title = 'Total emissions from production process';
}

let html = `
<h3>${title}</h3>
<div class="total-emission">
    <p>Total CO₂ emissions: <strong>${total.CO2.toFixed(2)} g</strong></p>
    ${total.shieldingGas > 0 ? `<p>Shielding Gas: <strong>${total.shieldingGas.toFixed(2)} g</strong></p>` : ''}
    ${total.weldingFume > 0 ? `<p>Welding Fume: <strong>${total.weldingFume.toFixed(2)} g</strong></p>` : ''}
    ${total.materialWaste.amount > 0 ? `
        <h4>Material Waste</h4>
        <p>Amount: <strong>${total.materialWaste.amount.toFixed(4)} ${total.materialWaste.unit}</strong></p>
        <p>Types: <strong>${total.materialWaste.types.join(', ')}</strong></p>
    ` : ''}
    ${total.rawMaterialWaste.amount > 0 ? `
        <h4>Raw Material Waste</h4>
        <p>Amount: <strong>${total.rawMaterialWaste.amount.toFixed(4)} ${total.rawMaterialWaste.unit}</strong></p>
        <p>Types: <strong>${total.rawMaterialWaste.types.join(', ')}</strong></p>
    ` : ''}
    ${total.additionalMaterialWaste.amount > 0 ? `
        <h4>Additional Material Waste</h4>
        <p>Amount: <strong>${total.additionalMaterialWaste.amount.toFixed(4)} ${total.additionalMaterialWaste.unit}</strong></p>
        <p>Types: <strong>${total.additionalMaterialWaste.types.join(', ')}</strong></p>
    ` : ''}
</div>
`;

if (total.CO2 > 0 || total.shieldingGas > 0 || total.weldingFume > 0) {
const childrenData = getChildrenData(item, level);

const filteredData = {
    labels: [],
    CO2: [],
    shieldingGas: [],
    weldingFume: []
};

childrenData.labels.forEach((label, index) => {
    if (childrenData.CO2[index] > 0 || 
        childrenData.shieldingGas[index] > 0 || 
        childrenData.weldingFume[index] > 0) {
        filteredData.labels.push(label);
        filteredData.CO2.push(childrenData.CO2[index]);
        filteredData.shieldingGas.push(childrenData.shieldingGas[index]);
        filteredData.weldingFume.push(childrenData.weldingFume[index]);
    }
});

if (filteredData.labels.length > 0) {
    html += createChartsHTML(filteredData, level);
}

}

outputSection.innerHTML = html;

if (total.CO2 > 0 || total.shieldingGas > 0 || total.weldingFume > 0) {
const childrenData = getChildrenData(item, level);
const filteredData = {
    labels: [],
    CO2: [],
    shieldingGas: [],
    weldingFume: []
};

childrenData.labels.forEach((label, index) => {
    if (childrenData.CO2[index] > 0 || 
        childrenData.shieldingGas[index] > 0 || 
        childrenData.weldingFume[index] > 0) {
        filteredData.labels.push(label);
        filteredData.CO2.push(childrenData.CO2[index]);
        filteredData.shieldingGas.push(childrenData.shieldingGas[index]);
        filteredData.weldingFume.push(childrenData.weldingFume[index]);
    }
});

if (filteredData.labels.length > 0) {
    renderCharts(filteredData, level);
}
}    
}

function getChildrenData(item, level) {
const data = {
labels: [],
CO2: [],
shieldingGas: [],
weldingFume: []
};

const subList = item.querySelector('.sub-list');
if (subList) {
subList.querySelectorAll('.project-item').forEach(child => {

    if (level === 0) {
        const childTotal = calculateTotalEmissions(child);
        data.labels.push(child.querySelector('.project-name').textContent);
        data.CO2.push(childTotal.CO2 || 0);
        data.shieldingGas.push(childTotal.shieldingGas || 0);
        data.weldingFume.push(childTotal.weldingFume || 0);
    } else if (level === 1) {
        const parentProject = child.parentElement.parentElement.parentElement;
        const parentProcess = child.parentElement.parentElement;
        const dataKey = `${parentProject.dataset.projectId}-${parentProcess.dataset.projectId}-${child.dataset.projectId}`;
        
        if (projectData.has(dataKey)) {
            const childData = projectData.get(dataKey);
            data.labels.push(child.querySelector('.project-name').textContent);
            data.CO2.push(childData.CO2 || 0);
            data.shieldingGas.push(childData.shieldingGas || 0);
            data.weldingFume.push(childData.weldingFume || 0);
        }
    }
});
}
return data;
}

document.addEventListener('click', function(e) {
if (e.target.closest('.project-item')) {
const item = e.target.closest('.project-item');
const level = getNestingLevel(item);

document.querySelectorAll('.project-item').forEach(i => i.classList.remove('selected'));
item.classList.add('selected');
document.getElementById('selected-project').textContent = item.querySelector('.project-name').textContent;

if (level === 2) {
    currentSubSubItem = item;
    showInputForm(item);

    const parentProject = item.parentElement.parentElement.parentElement;
    const parentProcess = item.parentElement.parentElement;

    const dataKey = `${parentProject.dataset.projectId}-${parentProcess.dataset.projectId}-${item.dataset.projectId}`;

    if (projectData.has(dataKey)) {
        showCurrentEmission(projectData.get(dataKey));
    } else {
        document.getElementById('output-section').innerHTML = '';
    }
} else {
    currentSubSubItem = null;
    showTotalEmissions(item, level);
}
}
});

function createChartsHTML(childrenData, level) {
return `
<div class="chart-container">
    <div class="chart-wrapper">
        <div class="chart-title">CO₂ Emissions Distribution</div>
        <canvas id="pieChart"></canvas>
    </div>
    <div class="chart-wrapper">
        <div class="chart-title">Emissions Comparison</div>
        <canvas id="barChart"></canvas>
    </div>
</div>
<div style="text-align: center; margin-top: 20px;">
    <button id="generate-report-btn">Download ISO 14040 Report (PDF)</button>
</div>
`;
}

function renderCharts(childrenData, level) {
if (window.pieChart && typeof window.pieChart.destroy === 'function') {
window.pieChart.destroy();
}
if (window.barChart && typeof window.barChart.destroy === 'function') {
window.barChart.destroy();
}

const pieCanvas = document.getElementById('pieChart');
const barCanvas = document.getElementById('barChart');
if (!pieCanvas || !barCanvas) return;

pieCanvas.width = pieCanvas.offsetWidth;
pieCanvas.height = pieCanvas.offsetHeight;
barCanvas.width = barCanvas.offsetWidth;
barCanvas.height = barCanvas.offsetHeight;
// Pie Chart for CO2 distribution
const pieCtx = pieCanvas.getContext('2d');
window.pieChart = new Chart(pieCtx, {
type: 'pie',
data: {
    labels: childrenData.labels,
    datasets: [{
        data: childrenData.CO2,
        backgroundColor: [
            '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', 
            '#FFC107', '#FF9800', '#FF5722', '#795548'
        ],
        borderColor: '#004d00',
        borderWidth: 1
    }]
},
options: {
    responsive: true,
    plugins: {
        legend: {
            position: 'right',
            labels: {
                color: 'black'
            }
        }
    }
}
});

// Bar Chart for comparing different emission types
const barCtx = document.getElementById('barChart').getContext('2d');
window.barChart = new Chart(barCtx, {
type: 'bar',
data: {
    labels: childrenData.labels,
    datasets: [
        {
            label: 'CO₂',
            data: childrenData.CO2,
            backgroundColor: '#4CAF50'
        }
    ]
},
options: {
    responsive: true,
    scales: {
        x: {
            ticks: {
                color: 'black'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: 'black'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
    },
    plugins: {
        legend: {
            labels: {
                color: 'black'
            }
        }
    }
}
});

// Add shielding gas and welding fume data if we're at level 1 (sub-items)
if (level === 1) {
window.barChart.data.datasets.push(
    {
        label: 'Shielding Gas',
        data: childrenData.shieldingGas,
        backgroundColor: '#8BC34A'
    },
    {
        label: 'Welding Fume',
        data: childrenData.weldingFume,
        backgroundColor: '#CDDC39'
    }
);
window.barChart.update();
}
}

function calculateTotalEmissions(item) {
const total = { 
CO2: 0, 
shieldingGas: 0, 
weldingFume: 0,
materialWaste: { amount: 0, types: [], unit: "kg" },
rawMaterialWaste: { amount: 0, types: [], unit: "kg" },
additionalMaterialWaste: { amount: 0, types: [], unit: "kg" }
};

// 安全检查 - 确保item存在且有parentElement
if (!item || !item.parentElement) {
return total;
}

const subList = item.querySelector('.sub-list');
if (subList) {
subList.querySelectorAll('.project-item').forEach(child => {
    // 安全获取父元素
    try {
        const parentProject = child.parentElement?.parentElement?.parentElement;
        const parentProcess = child.parentElement?.parentElement;

        // 如果无法获取必要的父元素，跳过这个子项
        if (!parentProject || !parentProcess) {
            return;
        }
    
        const dataKey = `${parentProject.dataset.projectId}-${parentProcess.dataset.projectId}-${child.dataset.projectId}`;

        if (projectData.has(dataKey)) {
            const data = projectData.get(dataKey);
            total.CO2 += data.CO2 || 0;
            total.shieldingGas += data.shieldingGas || 0;
            total.weldingFume += data.weldingFume || 0;
        
            // 累加材料废物
            if (data.materialWaste) {
                total.materialWaste.amount += data.materialWaste.amount || 0;
                total.materialWaste.types = [...new Set([...total.materialWaste.types, ...data.materialWaste.types])];
            }
            if (data.rawMaterialWaste) {
                total.rawMaterialWaste.amount += data.rawMaterialWaste.amount || 0;
                total.rawMaterialWaste.types = [...new Set([...total.rawMaterialWaste.types, ...data.rawMaterialWaste.types])];
            }
            if (data.additionalMaterialWaste) {
                total.additionalMaterialWaste.amount += data.additionalMaterialWaste.amount || 0;
                total.additionalMaterialWaste.types = [...new Set([...total.additionalMaterialWaste.types, ...data.additionalMaterialWaste.types])];
            }
        }
    } catch (error) {
        console.error('Error calculating emissions for child:', error);
    }
});
}
return total;
}

function updateParentEmissions() {
const currentItem = document.querySelector('.project-item.selected');
if (currentItem) {
const level = getNestingLevel(currentItem);
if (level < 2) {
    showTotalEmissions(currentItem, level);
}
}
}

document.addEventListener('click', function(e) {
if (e.target.id === 'next-btn') {
const siblings = Array.from(currentSubSubItem.parentElement.children);
const currentIndex = siblings.indexOf(currentSubSubItem);
if (currentIndex < siblings.length - 1) {
    currentSubSubItem.classList.remove('selected');
    currentSubSubItem = siblings[currentIndex + 1];
    currentSubSubItem.classList.add('selected');
    const newProjectName = currentSubSubItem.querySelector('.project-name').textContent;
    document.getElementById('selected-project').textContent = newProjectName;
    document.getElementById('output-section').innerHTML = '';

    showInputForm(currentSubSubItem);
}
}

// Handle click on total emissions display
if (e.target.closest('#total-emissions-display')) {
document.getElementById('input-section').innerHTML = '';
document.getElementById('selected-project').textContent = '';

const mainList = document.getElementById('main-list');
const projectsData = {
    labels: [],
    CO2: []
};

mainList.querySelectorAll('.project-item').forEach(project => {
    if (getNestingLevel(project) === 0) {
        const total = calculateTotalEmissions(project);
        if (total.CO2 > 0) {
            projectsData.labels.push(project.querySelector('.project-name').textContent);
            projectsData.CO2.push(total.CO2);
        }
    }
});

const outputSection = document.getElementById('output-section');
let html = `
    <h3 style="text-align: center; font-weight: bold;">Total emissions from all projects</h3>
    <div class="total-emission">
        <p>Total CO₂ emissions: <strong>${calculateAllProjectsTotal().CO2.toFixed(2)} g</strong></p>
    </div>
`;

if (projectsData.labels.length > 0) {
    html += createChartsHTML(projectsData, 0);
}

outputSection.innerHTML = html;

if (projectsData.labels.length > 0) {
    renderCharts(projectsData, 0);
}
}

if (e.target.id === 'generate-report-btn') {
const currentItem = document.querySelector('.project-item.selected');
if (!currentItem) return;

const level = getNestingLevel(currentItem);
generateReport(currentItem, level);
}

function generateReport(item, level) {
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.setFontSize(16);
doc.text("ISO 14040 Life Cycle Assessment Report", 10, 20);
doc.setFontSize(12);
doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 30);

let y = 40;

switch(level) {
    case 0:
        generateProjectReport(doc, item, y);
        break;
    case 1:
        generateProcessReport(doc, item, y);
        break;
    case 2:
        generateStepReport(doc, item, y);
        break;
}

doc.save("ISO14040_LCA_Report.pdf");

}
});

function generateProjectReport(doc, project, startY) {
let y = startY;
const projectName = project.querySelector('.project-name').textContent;
const total = calculateTotalEmissions(project);

doc.setFont(undefined, 'bold');
doc.text(`Project: ${projectName}`, 10, y);
y += 8;

doc.setFont(undefined, 'normal');
doc.text(`Total CO2 Emissions: ${total.CO2.toFixed(2)} g`, 15, y);
y += 10;

const subList = project.querySelector('.sub-list');
if (subList) {
subList.querySelectorAll('.project-item').forEach(process => {
    const processName = process.querySelector('.project-name').textContent;
    const processTotal = calculateTotalEmissions(process);

    doc.setFont(undefined, 'bold');
    doc.text(`Production Process: ${processName}`, 15, y);
    y += 8;

    doc.setFont(undefined, 'normal');
    doc.text(`Total CO2: ${processTotal.CO2.toFixed(2)} g`, 20, y);
    y += 8;

    const subSubList = process.querySelector('.sub-list');
    if (subSubList) {
        subSubList.querySelectorAll('.project-item').forEach(step => {
            const stepData = getStepData(step);
            if (stepData) {
                doc.text(`- ${step.querySelector('.project-name').textContent}: ${stepData.CO2.toFixed(2)} g`, 25, y);
                y += 6;

                if (stepData.shieldingGas) {
                    doc.text(`  Shielding Gas: ${stepData.shieldingGas.toFixed(2)} g`, 30, y);
                    y += 6;
                }
                if (stepData.weldingFume) {
                    doc.text(`  Welding Fume: ${stepData.weldingFume.toFixed(2)} g`, 30, y);
                    y += 6;
                }
            }
        });
    }

    y += 10;
    if (y > 270) {
        doc.addPage();
        y = 20;
    }
});
}

return y;
}

function generateProcessReport(doc, process, startY) {
let y = startY;
const processName = process.querySelector('.project-name').textContent;
const processTotal = calculateTotalEmissions(process);

doc.setFont(undefined, 'bold');
doc.text(`Production Process: ${processName}`, 10, y);
y += 8;

doc.setFont(undefined, 'normal');
doc.text(`Total CO2 Emissions: ${processTotal.CO2.toFixed(2)} g`, 15, y);
y += 10;

const subList = process.querySelector('.sub-list');
if (subList) {
subList.querySelectorAll('.project-item').forEach(step => {
    const stepData = getStepData(step);
    if (stepData) {
        doc.setFont(undefined, 'bold');
        doc.text(`Step: ${step.querySelector('.project-name').textContent}`, 15, y);
        y += 8;

        doc.setFont(undefined, 'normal');
        doc.text(`CO2: ${stepData.CO2.toFixed(2)} g`, 20, y);
        y += 6;

        if (stepData.shieldingGas) {
            doc.text(`Shielding Gas: ${stepData.shieldingGas.toFixed(2)} g`, 20, y);
            y += 6;
        }
        if (stepData.weldingFume) {
            doc.text(`Welding Fume: ${stepData.weldingFume.toFixed(2)} g`, 20, y);
            y += 6;
        }

        y += 8;
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    }
});
}

return y;
}

function generateStepReport(doc, step, startY) {
let y = startY;
const stepName = step.querySelector('.project-name').textContent;
const stepData = getStepData(step);

if (!stepData) return y;

doc.setFont(undefined, 'bold');
doc.text(`Production Step: ${stepName}`, 10, y);
y += 10;

doc.setFont(undefined, 'normal');
doc.text(`CO2 Emissions: ${stepData.CO2.toFixed(2)} g`, 15, y);
y += 8;

if (stepData.shieldingGas) {
doc.text(`Shielding Gas: ${stepData.shieldingGas.toFixed(2)} g`, 15, y);
y += 8;
}
if (stepData.weldingFume) {
doc.text(`Welding Fume: ${stepData.weldingFume.toFixed(2)} g`, 15, y);
y += 8;
}

doc.text(`Energy Type: ${stepData.energyType}`, 15, y);
y += 8;
doc.text(`Energy Used: ${stepData.energy} kWh`, 15, y);
y += 8;

if (stepData.materials) {
doc.text(`Materials: ${stepData.materials}`, 15, y);
y += 8;
}
if (stepData.additionalMaterials) {
doc.text(`Additional Materials: ${stepData.additionalMaterials}`, 15, y);
y += 8;
}

return y;
}

function getStepData(step) {
const parentProject = step.parentElement.parentElement.parentElement;
const parentProcess = step.parentElement.parentElement;
const dataKey = `${parentProject.dataset.projectId}-${parentProcess.dataset.projectId}-${step.dataset.projectId}`;
return projectData.get(dataKey);
}

function calculateAllProjectsTotal() {
const mainList = document.getElementById('main-list');
const totals = {
CO2: 0,
shieldingGas: 0,
weldingFume: 0,
materialWaste: { amount: 0, types: [], unit: "kg" },
rawMaterialWaste: { amount: 0, types: [], unit: "kg" },
additionalMaterialWaste: { amount: 0, types: [], unit: "kg" }
};

mainList.querySelectorAll('.project-item').forEach(project => {
if (getNestingLevel(project) === 0) {
    const projectTotal = calculateTotalEmissions(project);
    totals.CO2 += projectTotal.CO2;
    totals.shieldingGas += projectTotal.shieldingGas;
    totals.weldingFume += projectTotal.weldingFume;
    totals.materialWaste.amount += projectTotal.materialWaste.amount;
    totals.rawMaterialWaste.amount += projectTotal.rawMaterialWaste.amount;
    totals.additionalMaterialWaste.amount += projectTotal.additionalMaterialWaste.amount;
    totals.materialWaste.types = [...new Set([...totals.materialWaste.types, ...projectTotal.materialWaste.types])];
    totals.rawMaterialWaste.types = [...new Set([...totals.rawMaterialWaste.types, ...projectTotal.rawMaterialWaste.types])];
    totals.additionalMaterialWaste.types = [...new Set([...totals.additionalMaterialWaste.types, ...projectTotal.additionalMaterialWaste.types])];
}
});

return totals;
}

function updateAllProjectsTotal() {
const totals = calculateAllProjectsTotal();
document.getElementById('all-projects-total').textContent = `${totals.CO2.toFixed(2)} g`;
}


window.addEventListener('storage', function(event) {
if (event.key === 'lcaUserData') {
userData = JSON.parse(event.newValue);
// 刷新当前页面的显示
updateAllProjectsTotal();
// 其他必要的更新
const selectedItem = document.querySelector('.project-item.selected');
if (selectedItem) {
    const level = getNestingLevel(selectedItem);
    if (level === 2) {
        showInputForm(selectedItem);
    } else {
        showTotalEmissions(selectedItem, level);
    }
}
}
});