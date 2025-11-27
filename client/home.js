// A URL base do seu servidor FastAPI (ajuste se for diferente!)
const API_BASE_URL = "http://127.0.0.1:8000";
const API_TASKS_URL = `${API_BASE_URL}/tasks`;
const LOGIN_PAGE = "index.html"; // Sua página de login/cadastro

// --- 1. CONFIGURAÇÃO INICIAL (Ao carregar a página) ---
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário tem um token. Se não, redireciona.
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return; // Pára a execução do script
    }

    // Carrega as tarefas
    fetchTasks();
    
    // Adiciona ouvintes de evento aos elementos
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// --- 2. FUNÇÕES AUXILIARES ---

/**
 * Retorna os cabeçalhos de autenticação com o token JWT.
 * @param {string} contentType - O Content-Type.
 */
function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    return headers;
}

/**
 * Exibe uma mensagem de sucesso ou erro na área de mensagens.
 */
function displayMessage(message, isError = false) {
    const msgElement = document.getElementById('messageArea');
    if (!msgElement) return;
    
    msgElement.textContent = message;
    msgElement.style.color = isError ? '#ff6666' : '#90ee90'; 
    msgElement.style.textAlign = 'center';
    
    // Oculta a mensagem após 3 segundos
    setTimeout(() => { msgElement.textContent = ''; }, 3000); 
}

// --- 3. FUNÇÃO DE SAIR (LOGOUT) ---

function logout() {
    // 1. Remove o token de autenticação
    localStorage.removeItem('authToken'); 
    
    // 2. Redireciona o usuário para a página de login
    window.location.href = LOGIN_PAGE; 
}

// --- 4. OPERAÇÕES CRUD (TAREFAS) ---

// 4.1. LER Tarefas (READ)
async function fetchTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    taskList.innerHTML = '<p style="text-align: center; color: #ccc;">Carregando tarefas...</p>';
    
    try {
        const response = await fetch(API_TASKS_URL, { 
            headers: getAuthHeaders('') 
        });

        if (!response.ok) {
            throw new Error(`(${response.status}) Falha ao carregar tarefas. Faça o login novamente.`);
        }
        
        let tasks = await response.json();
        
        if (!Array.isArray(tasks)) {
             console.warn("A resposta do servidor não é uma lista. Usando lista vazia.");
             renderTasks([]); // Usa lista vazia
        } else {
             renderTasks(tasks); // Usa a lista retornada
        }

    } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        taskList.innerHTML = `<p style="color: red; text-align: center;">Erro: ${error.message}</p>`;
    }
}

/**
 * Constrói e exibe a lista de tarefas no HTML.
 */
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Limpa a lista

    if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: #ccc;">Nenhuma tarefa pendente. Comece a adicionar!</p>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        // Assumindo que o ID da tarefa é um número inteiro
        li.setAttribute('data-id', task.id); 
        
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="complete-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="window.toggleComplete(${task.id}, this.checked)">
                
                <span class="task-title-display ${task.completed ? 'completed' : ''}">
                    ${task.title}
                </span>
                <input type="text" class="task-title-input" value="${task.title}" style="display: none;">
            </div>
            
            <div class="task-actions">
                <button class="edit-btn action-btn" onclick="window.toggleEditMode(${task.id}, this)">
                    <i class='bx bx-edit'></i> Editar
                </button>
                <button class="save-btn action-btn" onclick="window.handleEditTask(${task.id}, this)" style="display: none;">
                    <i class='bx bx-check'></i> Salvar
                </button>
                <button class="delete-btn action-btn" onclick="window.deleteTask(${task.id})">
                    <i class='bx bx-trash'></i> Remover
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// 4.2. CRIAR Tarefa (CREATE)
async function handleAddTask(event) {
    event.preventDefault();
    const titleInput = document.getElementById('newTaskTitle');
    const title = titleInput.value.trim();

    if (!title) return;

    try {
        const newTask = { title: title, completed: false }; // Sempre começa como não-concluída
        
        const response = await fetch(API_TASKS_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(newTask)
        });
        
        if (!response.ok) throw new Error("Falha ao adicionar tarefa.");
        const addedTask = await response.json();
        titleInput.value = ''; // Limpa o campo
        displayMessage("Tarefa adicionada com sucesso!", false);
        fetchTasks(); // Recarrega a lista para mostrar o novo item

    } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);
        displayMessage("Erro ao adicionar tarefa. Verifique sua conexão.", true);
    }
}

// 4.3. ATUALIZAR Status (Completed/Uncompleted)
window.toggleComplete = async (taskId, isCompleted) => {
    try {
        const updateData = { completed: isCompleted };
        
        const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
            method: 'PATCH', // Usamos PATCH para atualizar apenas o campo 'completed'
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) throw new Error("Falha ao atualizar status.");

        // Atualiza a visualização na DOM imediatamente
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (isCompleted) {
            taskItem.classList.add('completed');
            taskItem.querySelector('.task-title-display').classList.add('completed');
        } else {
            taskItem.classList.remove('completed');
            taskItem.querySelector('.task-title-display').classList.remove('completed');
        }
        
        displayMessage(`Tarefa marcada como ${isCompleted ? 'concluída' : 'pendente'}!`, false);
        
    } catch (error) {
        console.error("Erro ao alternar status:", error);
        displayMessage("Erro ao alterar status. Tente novamente.", true);
    }
}


// 4.4. ATUALIZAR Título (UPDATE)
window.toggleEditMode = (taskId, button) => {
    const listItem = button.closest('.task-item');
    const titleDisplay = listItem.querySelector('.task-title-display');
    const titleInput = listItem.querySelector('.task-title-input');
    const editBtn = listItem.querySelector('.edit-btn');
    const saveBtn = listItem.querySelector('.save-btn');
    
    // Alterna a visibilidade dos elementos e botões
    if (listItem.classList.contains('edit-mode')) {
        // Sai do modo de edição
        listItem.classList.remove('edit-mode');
        titleDisplay.style.display = 'inline';
        titleInput.style.display = 'none';
        editBtn.style.display = 'inline-flex';
        saveBtn.style.display = 'none';
    } else {
        // Entra no modo de edição
        listItem.classList.add('edit-mode');
        titleDisplay.style.display = 'none';
        titleInput.style.display = 'inline-flex'; // ou 'block'
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-flex';
        titleInput.focus();
    }
}
        
window.handleEditTask = async (taskId, saveButton) => {
    const listItem = saveButton.closest('.task-item');
    const titleInput = listItem.querySelector('.task-title-input');
    const newTitle = titleInput.value.trim();
    
    if (!newTitle) return;

    try {
        const updateData = { title: newTitle };
        
        const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
            method: 'PUT', 
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) throw new Error("Falha ao atualizar tarefa.");
        
        // Atualiza a visualização e sai do modo de edição
        listItem.querySelector('.task-title-display').textContent = newTitle;
        toggleEditMode(taskId, saveButton); 
        displayMessage("Tarefa atualizada com sucesso!", false);

    } catch (error) {
        console.error("Erro ao editar tarefa:", error);
        displayMessage("Erro ao editar tarefa. Tente novamente.", true);
    }
}
        
// 4.5. REMOVER Tarefa (DELETE)
window.deleteTask = async (taskId) => {
    if (!confirm("Tem certeza que deseja remover esta tarefa?")) return;

    try {
        const response = await fetch(`${API_TASKS_URL}/${taskId}`, {
            method: 'DELETE',
            // Headers sem Content-Type JSON, apenas o de autenticação
            headers: getAuthHeaders(''), 
        });
        
        // 204 No Content é o esperado para DELETE bem sucedido
        if (response.status !== 204 && response.status !== 200) { 
             throw new Error("Falha ao remover tarefa.");
        }

        // Remove o elemento da DOM
        const listItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (listItem) listItem.remove();

        displayMessage("Tarefa removida com sucesso!", false);
        // Se a lista ficar vazia, recarrega para mostrar a mensagem "Nenhuma tarefa"
        if (document.getElementById('taskList').children.length === 0) {
            fetchTasks();
        }
        
    } catch (error) {
        console.error("Erro ao remover tarefa:", error);
        displayMessage("Erro ao remover tarefa. Tente novamente.", true);
    }
}