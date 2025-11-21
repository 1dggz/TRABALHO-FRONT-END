// MUDAR TELA DE LOGIN PARA CADASTRAR OU AO CONTRARIO
const showRegister = () => {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
};

const showLogin = () => {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
};

const register = (event) => { 
    event.preventDefault();
// Cadastro
    const email = document.getElementById("registerUser").value;
    const pass = document.getElementById("registerPass").value;

    if (email && pass) {
        const formRegister = {
            email : email,
            password: pass
        };
        // Fetch para conectar ao servidor.
        let url_cadastro = "https://musical-spoon-x5ggv9vwq4pr2655g-8000.app.github.dev/auth/signup";
        fetch (url_cadastro,{
            method : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formRegister)
        })
        .then(response => {
            if (response.ok) {
                alert("Cadastro realizado com sucesso!");
                showLogin();
            } else {
                return response.json().then(err => {throw new Error(err.message || "Falha ao cadastrar.");});
            }
        })
        .catch((error) => {
            console.error("Erro de Cadastro:",error);
            alert(`Erro ao tentar cadastrar: ${error.message}`);
        });
        
    }
    else {
    alert("Preencha todos os campos!!")
    }
};

// Login
const login = (event) => {
    event.preventDefault();// Impedir reload
    const email = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;
    const remember = document.getElementById("rememberMe").checked;

    if (email && pass) {
        const formLogin = {
            email: email,
            password: pass
        };

    let url_login = "https://musical-spoon-x5ggv9vwq4pr2655g-8000.app.github.dev/auth/login";
    fetch(url_login,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formLogin)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Credenciais Inválidas.");
    })
    .then(responseData => {
        const authToken = responseData.token;
        localStorage.setItem("authToken", authToken);
        if(remember){
            localStorage.setItem("rememberedEmail", email);  
        } else {
            localStorage.removeItem("rememberedEmail");
        }
        alert("Login realizado com sucesso!!");
        window.location.href = "home.html";
    })
    .catch((error) => {
        console.error("Erro de Login", error);
        alert(error.message || "Erro de conexão. Tente novamente mais tarde.");
    });
   }
};

// FAZER AGORA OS CONST PARA ADICIONAR, REMOVER , ATUALIZAR E VISUALIZAR