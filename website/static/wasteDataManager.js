document.addEventListener('DOMContentLoaded', function() {
    userData = DataManager.load();
    // Initialize the page
    loadUserData();
    setupSidebarNavigation();
    setupEnergyTypeSection();
    setupMaterialSection();
    setupWasteTypeSection();
    setupBackButton();
});

function loadUserData() {
  const savedData = localStorage.getItem('lcaUserData');
  userData = savedData ? JSON.parse(savedData) : JSON.parse(JSON.stringify(defaultData)); // 深拷贝默认数据
  return userData;
}

function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected content section
            const sectionId = this.getAttribute('data-section');
            if (sectionId === 'materials') {
                // 切换到Materials标签时，先销毁再重新初始化
                setupMaterialSection();
            }
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function setupBackButton() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        DataManager.save();
        showMain();
      });
    } else {
        console.error('Back button not found!');
    }
  }
  

// Energy Types Section
function setupEnergyTypeSection() {
    renderEnergyTypesTable();
    
    document.getElementById('energy-search').addEventListener('input', function() {
        renderEnergyTypesTable(this.value);
    });
    
    document.getElementById('add-energy-btn').addEventListener('click', addEnergyType);
    document.getElementById('update-energy-btn').addEventListener('click', updateEnergyType);
    document.getElementById('cancel-energy-edit').addEventListener('click', cancelEnergyEdit);
}

function renderEnergyTypesTable(searchTerm = '') {
    const tbody = document.getElementById('energy-table').querySelector('tbody');
    tbody.innerHTML = '';
    
    const filteredTypes = userData.energyTypes.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filteredTypes.forEach((type, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type.name}</td>
            <td>${type.factor}</td>
            <td>
                <button class="edit-energy-btn" data-index="${index}">Edit</button>
                <button class="delete-energy-btn" data-index="${index}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-energy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editEnergyType(index);
        });
    });
    
    document.querySelectorAll('.delete-energy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteEnergyType(index);
        });
    });
}

function editEnergyType(index) {
    // Find the energy type
    const type = userData.energyTypes[index];
    document.getElementById('energy-name').value = type.name;
    document.getElementById('energy-factor').value = type.factor;

    // Store the current edit index
    document.getElementById('energy-name').dataset.editIndex = index;

    // Toggle buttons - 修改这里
    document.getElementById('add-energy-btn').style.display = 'none';
    document.getElementById('update-energy-btn').style.display = 'inline-block';
    document.getElementById('cancel-energy-edit').style.display = 'inline-block';
}

function cancelEnergyEdit() {
    document.getElementById('energy-name').value = '';
    document.getElementById('energy-factor').value = '';
    delete document.getElementById('energy-name').dataset.editIndex;

    // Clear errors
    document.getElementById('energy-name-error').textContent = '';
    document.getElementById('energy-factor-error').textContent = '';

    // Toggle buttons - 修改这里
    document.getElementById('add-energy-btn').style.display = 'inline-block';
    document.getElementById('update-energy-btn').style.display = 'none';
    document.getElementById('cancel-energy-edit').style.display = 'none';
}

function validateEnergyType() {
    const name = document.getElementById('energy-name').value.trim();
    const factor = document.getElementById('energy-factor').value;
    
    let isValid = true;
    
    // Validate name
    if (!name) {
        document.getElementById('energy-name-error').textContent = 'Please enter an energy type name';
        isValid = false;
    } else {
        document.getElementById('energy-name-error').textContent = '';
    }
    
    // Validate factor
    if (isNaN(factor) || factor === '') {
        document.getElementById('energy-factor-error').textContent = 'Please enter a valid number';
        isValid = false;
    } else if (parseFloat(factor) < 0) {
        document.getElementById('energy-factor-error').textContent = 'Emission factor must be non-negative';
        isValid = false;
    } else {
        document.getElementById('energy-factor-error').textContent = '';
    }
    
    return isValid;
}

async function addEnergyType() {
    if (!validateEnergyType()) return;
    
    const name = document.getElementById('energy-name').value.trim();
    const factor = parseFloat(document.getElementById('energy-factor').value);
    
    // Check if name already exists
    if (userData.energyTypes.some(type => type.name.toLowerCase() === name.toLowerCase())) {
        document.getElementById('energy-name-error').textContent = 'This energy type already exists';
        return;
    }
    
    // Add new energy type
    userData.energyTypes.push({ name, factor });

    await Swal.fire({
        title: 'Success!',
        text: `Energy type ${name} added`,
        icon: 'success',
        confirmButtonText: 'OK'
    });
    
    // Clear form
    document.getElementById('energy-name').value = '';
    document.getElementById('energy-factor').value = '';
    
    // Refresh table
    renderEnergyTypesTable();
    DataManager.save();
}

function updateEnergyType() {
    if (!validateEnergyType()) return;
    
    const index = parseInt(document.getElementById('energy-name').dataset.editIndex);
    const name = document.getElementById('energy-name').value.trim();
    const factor = parseFloat(document.getElementById('energy-factor').value);
    
    // Check if name already exists (excluding current item)
    if (userData.energyTypes.some((type, i) => 
        i !== index && type.name.toLowerCase() === name.toLowerCase())) {
        document.getElementById('energy-name-error').textContent = 'This energy type already exists';
        return;
    }
    
    // Update energy type
    userData.energyTypes[index] = { name, factor };
    
    // Clear form and cancel edit
    cancelEnergyEdit();
    
    // Refresh table
    renderEnergyTypesTable();
    DataManager.save();
}

async function deleteEnergyType(index) {
    const result = await Swal.fire({
        title: 'Delete Energy Type?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        userData.energyTypes.splice(index, 1);
        renderEnergyTypesTable();
        
        // If we were editing this item, cancel the edit
        const editIndex = document.getElementById('energy-name').dataset.editIndex;
        if (editIndex && parseInt(editIndex) === index) {
            cancelEnergyEdit();
        }
        await Swal.fire('Deleted!', 'The energy type has been removed.', 'success');
    }
    DataManager.save();
}

// Materials Section
function setupMaterialSection() {
    // 初始化项目下拉菜单
    populateProjectDropdowns();
        
    // 更新子项目下拉菜单
    updateMaterialSubprojectDropdown();

    // 渲染材料表格
    renderMaterialTable();
    // 初始化废弃物类型选择器
    const $wasteTypesSelect = $('#material-waste-types');
    $wasteTypesSelect.select2({
        placeholder: 'Select waste types...',
        width: '100%',
        allowClear: true
    });

    // 填充废弃物类型选项
    updateWasteTypesSelect();

    // 搜索过滤事件
    document.getElementById('material-search').addEventListener('input', function() {
        renderMaterialTable(this.value);
    });

    // 项目过滤变化事件
    document.getElementById('material-project-filter').addEventListener('change', function() {
        updateSubprojectFilter();
        renderMaterialTable();
    });

    // 子项目过滤变化事件
    document.getElementById('material-subproject-filter').addEventListener('change', function() {
        renderMaterialTable();
    });

    // 项目选择变化事件（添加/编辑表单）
    document.getElementById('material-project').addEventListener('change', function() {
        updateMaterialSubprojectDropdown();
    });

    // 添加材料按钮事件
    document.getElementById('add-material-btn').addEventListener('click', addMaterial);

    // 更新材料按钮事件
    document.getElementById('update-material-btn').addEventListener('click', updateMaterial);

    // 取消编辑按钮事件
    document.getElementById('cancel-material-edit').addEventListener('click', cancelMaterialEdit);

    // 确保Select2在模态框显示时正确计算宽度
    $(document).on('shown.bs.modal', '.modal', function() {
        $wasteTypesSelect.select2({
            width: '100%'
        });
    });
}

function populateProjectDropdowns() {
    const projectFilter = document.getElementById('material-project-filter');
    const projectDropdown = document.getElementById('material-project');
    
    // Clear existing options except first
    while (projectFilter.options.length > 1) projectFilter.remove(1);
    while (projectDropdown.options.length > 1) projectDropdown.remove(1);
    
    // Add projects
    Object.keys(userData.projects).forEach(project => {
        const option1 = document.createElement('option');
        option1.value = project;
        option1.textContent = project;
        projectFilter.appendChild(option1.cloneNode(true));

        const option2 = option1.cloneNode(true);
        projectDropdown.appendChild(option2);
    });
}

function updateSubprojectFilter() {
    const projectFilter = document.getElementById('material-project-filter');
    const subprojectFilter = document.getElementById('material-subproject-filter');
    
    // Clear existing options except first
    while (subprojectFilter.options.length > 1) subprojectFilter.remove(1);
    
    const selectedProject = projectFilter.value;
    if (!selectedProject) return;
    
    // Add subprojects for selected project
    Object.keys(userData.projects[selectedProject]).forEach(subproject => {
        const option = document.createElement('option');
        option.value = subproject;
        option.textContent = subproject;
        subprojectFilter.appendChild(option);
    });
}

function updateMaterialSubprojectDropdown() {
    const projectDropdown = document.getElementById('material-project');
    const subprojectDropdown = document.getElementById('material-subproject');
    
    // Clear existing options except first
    while (subprojectDropdown.options.length > 1) subprojectDropdown.remove(1);
    
    const selectedProject = projectDropdown.value;
    if (!selectedProject) return;
    
    // Add subprojects for selected project
    Object.keys(userData.projects[selectedProject]).forEach(subproject => {
        const option = document.createElement('option');
        option.value = subproject;
        option.textContent = subproject;
        subprojectDropdown.appendChild(option);
    });
}

function renderMaterialTable(searchTerm = '') {
    //console.log("Data:", userData);
    const tbody = document.getElementById('material-table').querySelector('tbody');
    tbody.innerHTML = '';

    const projectFilter = document.getElementById('material-project-filter').value;
    const subprojectFilter = document.getElementById('material-subproject-filter').value;

    let allMaterials = [];

    Object.entries(userData.projects).forEach(([projectName, projectData]) => {
        if (projectFilter && projectFilter !== projectName) return;

        Object.entries(projectData).forEach(([subprojectName, subprojectData]) => {
            if (subprojectFilter && subprojectFilter !== subprojectName) return;

            if (subprojectData.materials) {
                ['materials', 'rawMaterials', 'additionalMaterials'].forEach(category => {
                    const materialList = subprojectData.materials[category];
                    if (materialList) {
                        materialList.forEach(material => {
                            allMaterials.push({
                                ...material,
                                project: projectName,
                                subproject: subprojectName,
                                category
                            });
                        });
                    }
                });
            }
        });
    });
    // Filter materials based on search term
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        allMaterials = allMaterials.filter(material =>
            material.name.toLowerCase().includes(lowerSearch) ||
            material.wasteType.join(', ').toLowerCase().includes(lowerSearch) ||
            material.project.toLowerCase().includes(lowerSearch) ||
            material.subproject.toLowerCase().includes(lowerSearch)
        );
    }

    // Sort materials by project, subproject, and name
    allMaterials.forEach((material) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${material.name}</td>
        <td>${material.wasteFactor}</td>
        <td>${material.wasteType.join(', ')}</td>
        <td>${material.project}</td>
        <td>${material.subproject}</td>
        <td>${material.category}</td>
        <td class="action-buttons-cell">
            <div class="action-buttons">
              <button class="edit-material-btn" 
                      data-project="${material.project}"
                      data-subproject="${material.subproject}"
                      data-category="${material.category}"
                      data-material-name="${material.name}">Edit</button>
              <button class="delete-material-btn"
                      data-project="${material.project}"
                      data-subproject="${material.subproject}"
                      data-category="${material.category}"
                      data-material-name="${material.name}">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-material-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const project = this.getAttribute('data-project');
            const subproject = this.getAttribute('data-subproject');
            const category = this.getAttribute('data-category');
            const materialName = this.getAttribute('data-material-name');
            editMaterial(project, subproject, category, materialName);
        });
    });

    document.querySelectorAll('.delete-material-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const project = this.getAttribute('data-project');
            const subproject = this.getAttribute('data-subproject');
            const category = this.getAttribute('data-category');
            const materialName = this.getAttribute('data-material-name');
            deleteMaterial(project, subproject, category, materialName);
        });
    });
}


        
function editMaterial(project, subproject, category, materialName) {
    // Find the material
    const material = userData.projects[project][subproject].materials[category]
        .find(m => m.name === materialName);
    if (!material) return;
        
    // Fill the form
    const nameInput = document.getElementById('material-name');
    nameInput.value = material.name;
    document.getElementById('material-waste-factor').value = material.wasteFactor;
    document.getElementById('material-project').value = project;
    document.getElementById('material-subproject').value = subproject;
    document.getElementById('material-category').value = category;
        
    // Store the edit information
    nameInput.dataset.editProject = project;
    nameInput.dataset.editSubproject = subproject;
    nameInput.dataset.editCategory = category;
    nameInput.dataset.editMaterialName = materialName;
        
    // Toggle buttons - 修改这里
    document.getElementById('add-material-btn').style.display = 'none';
    document.getElementById('update-material-btn').style.display = 'inline-block';
    document.getElementById('cancel-material-edit').style.display = 'inline-block';
        
    // Update subproject dropdown
    updateMaterialSubprojectDropdown();
        
    // Set the selected waste types
    $('#material-waste-types').val(material.wasteType).trigger('change');
        
    // 自动聚焦到名称输入框
    setTimeout(() => {
        nameInput.focus();
    }, 100);

    DataManager.save();
}


function cancelMaterialEdit() {
    document.getElementById('material-name').value = '';
    document.getElementById('material-waste-factor').value = '';
    document.getElementById('material-waste-types').value = '';
    const defaultProject = Object.keys(userData.projects)[0] || '';
    document.getElementById('material-project').value = defaultProject;
    updateMaterialSubprojectDropdown();
        
    document.getElementById('material-category').value = 'materials';
    // Clear edit data
    delete document.getElementById('material-name').dataset.editProject;
    delete document.getElementById('material-name').dataset.editSubproject;
    delete document.getElementById('material-name').dataset.editCategory;
    delete document.getElementById('material-name').dataset.editMaterialName;
        
    // Clear errors
    document.getElementById('material-name-error').textContent = '';
    document.getElementById('material-waste-factor-error').textContent = '';
    document.getElementById('material-waste-types-error').textContent = '';
        
    // Toggle buttons - 修改这里
    document.getElementById('add-material-btn').style.display = 'inline-block';
    document.getElementById('update-material-btn').style.display = 'none';
    document.getElementById('cancel-material-edit').style.display = 'none';
    // Clear waste types selection
    $('#material-waste-types').val(null).trigger('change');
}

function validateMaterial() {
    const name = document.getElementById('material-name').value.trim();
    const wasteFactor = document.getElementById('material-waste-factor').value;
    const selectedWasteTypes = $('#material-waste-types').val() || [];
    const project = document.getElementById('material-project').value;
    const subproject = document.getElementById('material-subproject').value;
    const category = document.getElementById('material-category').value;
    
    let isValid = true;
    
    // Validate name
    if (!name) {
        document.getElementById('material-name-error').textContent = 'Please enter a material name';
        isValid = false;
    } else {
        document.getElementById('material-name-error').textContent = '';
    }
    
    // Validate waste factor
    if (isNaN(wasteFactor)) {
        document.getElementById('material-waste-factor-error').textContent = 'Please enter a valid number';
        isValid = false;
    } else if (parseFloat(wasteFactor) < 0) {
        document.getElementById('material-waste-factor-error').textContent = 'Factor must be non-negative';
        isValid = false;
    } else {
        document.getElementById('material-waste-factor-error').textContent = '';
    }
    
    // Validate waste types
    if (selectedWasteTypes.length === 0) {
        document.getElementById('material-waste-types-error').textContent = 'Please enter at least one waste type';
        isValid = false;
    } else {
        document.getElementById('material-waste-types-error').textContent = '';
    }
    
    // Validate project and subproject
    if (!project || !subproject) {
        isValid = false;
        // Note: The dropdowns should prevent this case
    }
    
    return isValid;
}

async function addMaterial() {
    if (!validateMaterial()) return;

    const name = document.getElementById('material-name').value.trim();
    const wasteFactor = parseFloat(document.getElementById('material-waste-factor').value);
    const project = document.getElementById('material-project').value;
    const subproject = document.getElementById('material-subproject').value;
    const category = document.getElementById('material-category').value;

    // 检查是否已存在同名材料
    const materials = userData.projects[project][subproject].materials[category];
    if (materials.some(m => m.name === name)) {
        document.getElementById('material-name-error').textContent = 'This material already exists in this category';
        return;
    }

    // 获取选中的 Waste Types（从 Select2）
    const selectedWasteTypes = $('#material-waste-types').val() || [];
    if (selectedWasteTypes.length === 0) {
        document.getElementById('material-waste-types-error').textContent = 'Please select at least one waste type';
        return;
    }

    // 添加材料
    materials.push({
        name,
        wasteFactor,
        wasteType: selectedWasteTypes,
        unit: "kg/kg"
    });

    DataManager.save();

    await Swal.fire({
        title: `<span class="success-title">Success!</span>`,
        html: `Material <b>${name} added to:<br>
               <b>${project} > ${subproject} > ${category}</b>`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
            confirmButton: 'success-btn',
            title: 'success-title'
        }
    });

    cancelMaterialEdit();
    renderMaterialTable();
}

function updateMaterial() {
    if (!validateMaterial()) return;
        
    const name = document.getElementById('material-name').value.trim();
    const wasteFactor = parseFloat(document.getElementById('material-waste-factor').value);
    const selectedWasteTypes = $('#material-waste-types').val() || []; // 这是正确的获取方式
        
    const project = document.getElementById('material-project').value;
    const subproject = document.getElementById('material-subproject').value;
    const category = document.getElementById('material-category').value;
        
    // Get original material info
    const originalProject = document.getElementById('material-name').dataset.editProject;
    const originalSubproject = document.getElementById('material-name').dataset.editSubproject;
    const originalCategory = document.getElementById('material-name').dataset.editCategory;
    const originalName = document.getElementById('material-name').dataset.editMaterialName;
        
    // 1. 验证原始项目是否存在
    if (!userData.projects[originalProject]) {
        Swal.fire('Error', `Original project "${originalProject}" no longer exists`, 'error');
        renderMaterialTable();
        return;
    }

    // 2. 验证原始子项目是否存在
    if (!userData.projects[originalProject][originalSubproject]) {
        Swal.fire('Error', `Original subproject "${originalSubproject}" no longer exists in project "${originalProject}"`, 'error');
        renderMaterialTable();
        return;
    }

    // 3. 验证原始材料是否存在
    const originalMaterials = userData.projects[originalProject][originalSubproject].materials[originalCategory];
    if (!originalMaterials) {
        Swal.fire('Error', `Original category "${originalCategory}" no longer exists`, 'error');
        renderMaterialTable();
        return;
    }

    const materialIndex = originalMaterials.findIndex(m => m.name === originalName);
    if (materialIndex === -1) {
        Swal.fire('Error', 'The material you are trying to edit no longer exists', 'error');
        renderMaterialTable();
        return;
    }

    // 4. 验证新项目是否存在（如果不同）
    if (project !== originalProject && !userData.projects[project]) {
        Swal.fire('Error', `Target project "${project}" does not exist`, 'error');
        return;
    }

    // 5. 验证新子项目是否存在（如果不同）
    if (subproject !== originalSubproject && !userData.projects[project][subproject]) {
        Swal.fire('Error', `Target subproject "${subproject}" does not exist in project "${project}"`, 'error');
        return;
    }

    // Check if name already exists (excluding current item)
    if (name !== originalName) {
        const materials = userData.projects[projectName][subProjectName].materials[materialCategory];
        if (materials.some(m => m.name === name)) {
            document.getElementById('material-name-error').textContent = 'This material already exists in this category';
            return;
        }
    }
    // If category or project/subproject changed, we need to move the material
    if (originalProject !== project || originalSubproject !== subproject || originalCategory !== category) {
        // Remove from original location
        const [movedMaterial] = originalMaterials.splice(materialIndex, 1);
    
        // Update the material properties
        movedMaterial.name = name;
        movedMaterial.wasteFactor = wasteFactor;
        movedMaterial.wasteType = selectedWasteTypes;
    
        // Add to new location
        userData.projects[projectName][subProjectName].materials[materialCategory].push(movedMaterial);
    } else {
        // Just update the existing material
        originalMaterials[materialIndex] = {
            name,
            wasteFactor,
            wasteType: selectedWasteTypes,
            unit: "kg/kg"
        };
    }

    // Clear form
    cancelMaterialEdit();

    // Refresh table
    renderMaterialTable();
    DataManager.save();

    // 显示成功消息
    Swal.fire('Updated!', 'Material has been updated successfully.', 'success');
}

async function deleteMaterial(project, subproject, category, materialName) {
    const result = await Swal.fire({
        title: 'Delete Material?',
        html: `You are about to delete <b>${materialName}</b>. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Keep Material',
        confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        const materials = userData.projects[project][subproject].materials[category];
        const index = materials.findIndex(m => m.name === materialName);
        
        if (index !== -1) {
            materials.splice(index, 1);
            renderMaterialTable();
            DataManager.save();
            // If we were editing this item, cancel the edit
            const editMaterialName = document.getElementById('material-name').dataset.editMaterialName;
            if (editMaterialName && editMaterialName === materialName) {
                cancelMaterialEdit();
            }
        }

        await Swal.fire(
            'Material Deleted',
            `${materialName} has been removed from ${project} > ${subproject}.`,
            'success'
        );
    }
    
}

// Waste Types Section
function setupWasteTypeSection() {
    renderWasteTypesList();
    
    document.getElementById('waste-search').addEventListener('input', function() {
        renderWasteTypesList(this.value);
    });
    
    document.getElementById('add-waste-type-btn').addEventListener('click', addWasteType);
}

function renderWasteTypesList(searchTerm = '') {
    const list = document.getElementById('waste-type-list');
    list.innerHTML = '';
        
    const filteredTypes = userData.wasteTypes.filter(type => 
        type.toLowerCase().includes(searchTerm.toLowerCase())
    );
        
    filteredTypes.forEach((type) => {
        const item = document.createElement('li');
        item.className = 'waste-type-item';
        item.innerHTML = `
            <div class="waste-type-display">
                <span>${type}</span>
                <div class="waste-type-actions">
                    <button class="edit-waste-type-btn" data-type="${type}">Edit</button>
                    <button class="delete-waste-type-btn" data-type="${type}">Delete</button>
                </div>
            </div>
            <div class="waste-type-edit">
                <div class="waste-type-edit-input-container">
                    <input type="text" class="waste-type-edit-input" value="${type}">
                </div>
                <div class="waste-type-edit-buttons">
                    <button class="save-waste-type-btn" data-type="${type}">Save</button>
                    <button class="cancel-waste-type-edit-btn">Cancel</button>
                </div>
            </div>
        `;
        list.appendChild(item);
        
        // 添加编辑事件监听器
        const editBtn = item.querySelector('.edit-waste-type-btn');
        const deleteBtn = item.querySelector('.delete-waste-type-btn');
        const saveBtn = item.querySelector('.save-waste-type-btn');
        const cancelBtn = item.querySelector('.cancel-waste-type-edit-btn');
        const displayDiv = item.querySelector('.waste-type-display');
        const editDiv = item.querySelector('.waste-type-edit');
        const editInput = item.querySelector('.edit-waste-type-input');
        
        editBtn.addEventListener('click', function() {
            // 获取当前列表项的DOM元素
            const listItem = this.closest('.waste-type-item');

            // 显示/隐藏编辑区域
            listItem.querySelector('.waste-type-display').style.display = 'none';
            const editDiv = listItem.querySelector('.waste-type-edit');
            editDiv.style.display = 'flex';
            editDiv.classList.add('active');

            // 获取输入框并聚焦 - 确保在当前列表项范围内查找
            const editInput = listItem.querySelector('.waste-type-edit-input');
            if (editInput) {
                editInput.focus();
                // 可选：选中所有文本
                editInput.setSelectionRange(0, editInput.value.length);
            } else {
                console.error('Could not find edit input for waste type');
            }
        });
        
        cancelBtn.addEventListener('click', function() {
            const listItem = this.closest('.waste-type-item');
            const displayDiv = listItem.querySelector('.waste-type-display');
            const editDiv = listItem.querySelector('.waste-type-edit');
                        
            // 正确恢复显示状态
            displayDiv.style.display = 'flex'; // 明确设置为flex
            editDiv.style.display = 'none';
            editDiv.classList.remove('active');
                        
            // 强制浏览器重绘
            void listItem.offsetHeight;
        });
        
        saveBtn.addEventListener('click', async function() {
            // 获取当前列表项的DOM元素
            const listItem = this.closest('.waste-type-item');

            // 从当前列表项范围内获取输入框
            const editInput = listItem.querySelector('.waste-type-edit-input');
            if (!editInput) {
                console.error('Edit input not found in list item:', listItem);
                await Swal.fire('Error', 'Cannot find the input field', 'error');
                return;
            }
        
            const oldName = this.getAttribute('data-type');
            const newName = editInput.value.trim();

            // 其余保存逻辑保持不变...
            if (!newName) {
                await Swal.fire('Error', 'Waste type name cannot be empty', 'error');
                return;
            }

            if (newName !== oldName && userData.wasteTypes.includes(newName)) {
                await Swal.fire('Error', 'This waste type name already exists', 'error');
                return;
            }

            // 更新废弃物类型名称
            await updateWasteTypeName(oldName, newName);
        });
        
        deleteBtn.addEventListener('click', async function() {
            const wasteType = this.getAttribute('data-type');
            await deleteWasteType(wasteType);
        });
    });
}

function validateWasteType() {
    const name = document.getElementById('new-waste-type').value.trim();
    let isValid = true;
    
    if (!name) {
        document.getElementById('waste-type-error').textContent = 'Please enter a waste type name';
        isValid = false;
    } else if (userData.wasteTypes.includes(name)) {
        document.getElementById('waste-type-error').textContent = 'This waste type already exists';
        isValid = false;
    } else {
        document.getElementById('waste-type-error').textContent = '';
    }
    
    return isValid;
}

async function addWasteType() {
    if (!validateWasteType()) {
        return;
    }
    
    const name = document.getElementById('new-waste-type').value.trim();
    // Check if name already exists
    userData.wasteTypes.push(name);
    DataManager.save();

    await Swal.fire({
        title: `<span class="success-title">Success!</span>`,
        html: `Waste type <b>${name}</b> added`,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
            confirmButton: 'success-btn',
            title: 'success-title'
        }
    });

    // Clear input
    document.getElementById('new-waste-type').value = '';
    // Refresh list
    renderWasteTypesList();
    // Update the select2 options
    updateWasteTypesSelect();
}

function updateWasteTypesSelect() {
    const $select = $('#material-waste-types');
    const selectedValues = $select.val() || [];

    // 销毁现有Select2实例（如果已初始化）
    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
    }

    // 清空并重新填充选项
    $select.empty();
    userData.wasteTypes.forEach(wasteType => {
        $select.append($('<option>', {
            value: wasteType,
            text: wasteType
        }));
    });

    // 重新初始化Select2
    $select.select2({
        placeholder: 'Select waste types...',
        width: '100%',
        allowClear: true
    });

    // 恢复选中状态（如果有）
    if (selectedValues.length > 0) {
        $select.val(selectedValues).trigger('change');
    }
}

async function updateWasteTypeName(oldName, newName) {
    // 1. 检查是否有材料使用这个废弃物类型
    const affectedMaterials = findMaterialsUsingWasteType(oldName);
    
    if (affectedMaterials.length > 0) {
        // 2. 更新所有使用该废弃物类型的材料
        affectedMaterials.forEach(({ project, subproject, category, materialName }) => {
            const materials = userData.projects[project]?.[subproject]?.materials?.[category];
            if (!materials) return;

            const material = materials.find(m => m.name === materialName);
            if (material) {
                // 替换废弃物类型名称
                material.wasteType = material.wasteType.map(t => t === oldName ? newName : t);
            }
        });
    }

    // 3. 更新废弃物类型列表
    const index = userData.wasteTypes.indexOf(oldName);
    if (index !== -1) {
        userData.wasteTypes[index] = newName;
    }

    // 4. 保存并刷新界面
    DataManager.save();
    renderWasteTypesList();
    updateWasteTypesSelect();
    renderMaterialTable();

    await Swal.fire(
        'Success',
        `Waste type "${oldName}" has been renamed to "${newName}"`,
        'success'
    );
}

async function deleteWasteType(wasteType) {
    // 1. 查找使用该废弃物类型的材料
    const affectedMaterials = findMaterialsUsingWasteType(wasteType);
    
    if (affectedMaterials.length > 0) {
        // 如果有材料使用该废弃物类型，禁止删除并显示提示
        const materialList = affectedMaterials.map(m => 
            `• ${m.materialName} (Project: ${m.project}, Subproject: ${m.subproject})`
        ).join('<br>');
        
        await Swal.fire({
            title: 'Cannot Delete Waste Type',
            html: `This waste type is used by the following materials:<br><br>${materialList}<br><br>Please remove it from all materials before deleting.`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // 2. 如果没有材料使用，显示确认对话框
    const result = await Swal.fire({
        title: 'Delete Waste Type?',
        text: `Are you sure you want to delete "${wasteType}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
    });
    
    if (result.isConfirmed) {
        // 3. 执行删除
        const index = userData.wasteTypes.indexOf(wasteType);
        if (index !== -1) {
            userData.wasteTypes.splice(index, 1);
            DataManager.save();
            renderWasteTypesList();
            updateWasteTypesSelect();
            
            await Swal.fire(
                'Deleted!',
                `Waste type "${wasteType}" has been removed.`,
                'success'
            );
        }
    }
}
function findMaterialsUsingWasteType(wasteType) {
    const affectedMaterials = [];

    Object.entries(userData.projects).forEach(([projectName, projectData]) => {
        Object.entries(projectData).forEach(([subprojectName, subprojectData]) => {
            if (subprojectData.materials) {
                ['materials', 'rawMaterials', 'additionalMaterials'].forEach(category => {
                    const materials = subprojectData.materials[category] || [];
                    materials.forEach(material => {
                        if (material?.wasteType?.includes(wasteType)) {
                            affectedMaterials.push({
                                project: projectName,
                                subproject: subprojectName,
                                category,
                                materialName: material.name
                            });
                        }
                    });
                });
            }
        });
    });

    return affectedMaterials;
}


document.getElementById('reset-btn').addEventListener('click', async function() {
    const result = await Swal.fire({
        title: 'Reset All Data?',
        html: `<span style="color: #e53935">This will permanently delete all your custom data and restore defaults.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Reset',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef5350',
        cancelButtonColor: '#81c784',
        focusCancel: true,
        customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm-btn'
        }
    });

    if (result.isConfirmed) {
        localStorage.removeItem('lcaUserData');
        location.reload();
    }
});

window.addEventListener('storage', function(event) {
    if (event.key === 'lcaUserData') {
        userData = JSON.parse(event.newValue);
        // 刷新当前页面的显示
        if (document.getElementById('energy-types')?.classList.contains('active')) {
            renderEnergyTypesTable();
        }
        if (document.getElementById('materials')?.classList.contains('active')) {
            renderMaterialTable();
        }
        if (document.getElementById('waste-types')?.classList.contains('active')) {
            renderWasteTypesList();
        }
    }
});