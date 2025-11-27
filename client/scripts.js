// URL base do seu servidor FastAPI
// Use uma constante no topo para facilitar a manutenção
const API_BASE_URL = "http://127.0.0.1:8000";
const TODOS_PAGE = "home.html"; // Nome da sua página de tarefas

// --- MUDAR TELA DE LOGIN PARA CADASTRAR OU AO CONTRARIO ---
const showRegister = () => {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
};

const showLogin = () => {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
};

// --- FUNÇÃO DE CADASTRO ---
const register = async (event) => { 
    event.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerUser").value;
    const pass = document.getElementById("registerPass").value;

    if (!name|| !email || !pass) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const formRegister = {
            email : email,
            password: pass,
            name: name
        };
        
        const url_cadastro = `${API_BASE_URL}/auth/signup`;

        const response = await fetch(url_cadastro, {
            method : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formRegister)
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Faça login.");
            showLogin();
        } else {
            // Tenta obter a mensagem de erro detalhada do FastAPI
            const errorData = await response.json();
            const errorMessage = errorData.detail || errorData.message || "Falha ao cadastrar. Tente outro e-mail.";
            alert(`Erro no cadastro: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Erro de Cadastro:", error);
        alert(`Erro de conexão com o servidor. Verifique o console.`);
    }
};

// --- FUNÇÃO DE LOGIN ---
const login = async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;
    const remember = document.getElementById("rememberMe").checked;

    if (!email || !pass) {
        alert("Preencha todos os campos!");
        return;
    }

    // Usando o formato JSON (correto se seu FastAPI suporta JSON no endpoint de login)
    const formLogin = {
        email: email,
        password: pass
    };
    
    try {
        const url_login = `${API_BASE_URL}/auth/login`; 
        
        const response = await fetch(url_login, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formLogin)
        });

        if (!response.ok) {
            // Não precisa de `throw new Error("Credenciais Inválidas.");` pois o bloco `catch` fará isso.
            // Apenas lança um erro para o bloco `catch` tratar
            const errorData = await response.json();
            throw new Error(errorData.detail || "Credenciais Inválidas.");
        }

        const responseData = await response.json();
        const authToken = responseData.access_token;
        // 1. Salva o Token
        localStorage.setItem("authToken", authToken);
        
        // 2. Gerencia o "Lembrar Senha"
        if (remember) {
            localStorage.setItem("rememberedEmail", email);  
        } else {
            localStorage.removeItem("rememberedEmail");
        }
        
        alert("Login realizado com sucesso!");
        
        // 3. Redireciona
        window.location.href = TODOS_PAGE; 

    } catch (error) {
        console.error("Erro de Login", error);
        alert(`Falha no Login: ${error.message || "Erro de conexão com o servidor."}`);
    }
};

// Opcional: Carregar email salvo ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        document.getElementById("loginUser").value = rememberedEmail;
        document.getElementById("rememberMe").checked = true;
    }
});