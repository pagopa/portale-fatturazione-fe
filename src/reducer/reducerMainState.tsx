export function reducerMainState(mainState, action) {
    const updateInfoObj = action.value;
    if (action.type === 'MODIFY_MAIN_STATE') {
    
        return {
            ...mainState, ...updateInfoObj      
        };
    } /*else if (action.type === 'toggle-todo') {
        return todos.map((todo) => {
            if (todo.id !== action.id) {
                return todo;
            }
  
            return {
                ...todo,
                isCompleted: !todo.isCompleted,
            };
        });
    } else if (action.type === 'delete-todo') {
        return todos.filter((todo) => todo.id !== action.id);
    }*/
}