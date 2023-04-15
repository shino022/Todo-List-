/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read

const myFetch = (url, options) => new Promise((res, rej) => {
    // console.log(Object.keys(options.headers)[0],Object.values(options.headers)[0]);

    const xhttp = new XMLHttpRequest();
    const method = options?.method ?? "GET";
    const body = options?.body;

    xhttp.open(method, url, true);
    if (options?.headers) {
        xhttp.setRequestHeader(Object.keys(options.headers)[0], Object.values(options.headers)[0]);
        // console.log(Object.keys(options.headers)[0],Object.values(options.headers)[0]);
    }
    xhttp.onload = function () {
        if (this.status == 200) {
            res(xhttp.response);
        }
    };
    xhttp.send(body);
});

const APIs = (() => {
    const createTodo = (newTodo) => {
        return myFetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => JSON.parse(res));
    };

    const deleteTodo = (id) => {
        return myFetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => JSON.parse(res));
    };

    const getTodos = () => {
        return myFetch("http://localhost:3000/todos").then((res) => JSON.parse(res));
    };
    return { createTodo, deleteTodo, getTodos };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const todolistEl = document.querySelector(".todo-list");
    const completedTodolistEl = document.querySelector(".completed-todo-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    const renderTodos = (todos) => {
        let todosTemplate = "";
        let completedTodosTemplate = "";
        todos.forEach((todo) => {
            const liTemplate = `<li><span>${todo.content}</span><button class="delete-btn" id="${todo.id}">delete</button></li>`;
            todo.completed ? completedTodosTemplate += liTemplate : todosTemplate += liTemplate;
        });
        if (todos.length === 0) {
            todosTemplate = "<h4>no task to display!</h4>";
        }
        todolistEl.innerHTML = todosTemplate;
        completedTodolistEl.innerHTML = completedTodosTemplate;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                      1. read the value from input
                      2. post request
                      3. update view
                  */
            const inputValue = view.inputEl.value;
            model.createTodo({ content: inputValue, completed: false }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    const handleDelete = () => {
        //event bubbling
        /* 
                1. get id
                2. make delete request
                3. update view, remove
            */
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
