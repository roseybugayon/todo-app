import { generateClient } from "aws-amplify/api";
import { useEffect, useState } from "react";
import AddTodoModal from "./AddTodoModal";
import { Todo } from "./API";
import plus from "./assets/Plus.png";
import { updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import "./styles/HomePage.css";
import { getFormattedDate } from "./utils";

const client = generateClient();

function TodoComponent({
  item,
  updateCompleted,
}: {
  item: Todo;
  updateCompleted: (id: string) => void;
}) {
  return (
    <div className="todoContainer" onClick={() => updateCompleted(item.id)}>
      <div className="checkAndTitle">
        <label className="checkboxContainer">
          <input
            type="checkbox"
            defaultChecked={false}
            checked={item.isCompleted ?? false}
          />
          <span className="checkbox"></span>
        </label>
        <p>{item.description}</p>
        {item.priority && (
          <div className={`priority priority-${item.priority}`}>
            {item.priority}
          </div>
        )}
      </div>
      <p>{getFormattedDate(item.date)}</p>
    </div>
  );
}

export function HomePage() {
  const [todos, setTodos] = useState<Todo[] | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  async function fetchTodos() {
    if (todos?.length != 0) {
      const result = await client.graphql({
        query: listTodos,
      });

      setTodos(result.data.listTodos.items);
      console.log(result);
    }
  }

  async function updateCompleted(id: string) {
    if (todos) {
      var item = todos.find((x) => x.id === id);
      const updatedTodos = todos?.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      );

      setTodos(updatedTodos);

      await client.graphql({
        query: updateTodo,
        variables: {
          input: {
            id: id,
            date: item?.date,
            description: item?.description,
            priority: item?.priority,
            isCompleted: !item?.isCompleted,
          },
        },
      });
    }
  }

  useEffect(() => {
    if (todos == undefined) {
      fetchTodos();
    }
  }, []);

  return (
    <div className="homePage">
      <h1>TODO App</h1>
      <div className="addTodo" onClick={() => setIsAddModalOpen(true)}>
        <img src={plus} alt="plus sign" />
      </div>
      <div className="todoList">
        {todos &&
          todos.length > 0 &&
          todos.map((item) => {
            return (
              <TodoComponent
                key={item.id}
                item={item}
                updateCompleted={updateCompleted}
              />
            );
          })}
      </div>
      <AddTodoModal
        isOpen={isAddModalOpen}
        closeModal={() => setIsAddModalOpen(false)}
        fetchTodos={fetchTodos}
      />
    </div>
  );
}
