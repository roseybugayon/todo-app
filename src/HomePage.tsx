import { generateClient } from "aws-amplify/api";
import { useEffect, useMemo, useState } from "react";
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
  const [formattedDate, setFormattedDate] = useState<string>("");

  useMemo(() => {
    if (item.date) {
      setFormattedDate(getFormattedDate(item.date));
    }
  }, [item.date]);

  return (
    <div className="todoContainer" onClick={() => updateCompleted(item.id)}>
      <div className="checkAndTitle">
        <label className="checkboxContainer">
          <input type="checkbox" checked={item.isCompleted ?? false} />
          <span className="checkbox"></span>
        </label>
        <p className={`${item.isCompleted ? "completed" : ""}`}>
          {item.description}
        </p>
        {item.priority && (
          <div
            className={`priority priority-${item.priority} ${
              item.isCompleted ? "completed" : ""
            }`}
          >
            {item.priority}
          </div>
        )}
      </div>
      <p>{formattedDate && formattedDate}</p>
    </div>
  );
}

export function HomePage() {
  const [todos, setTodos] = useState<Todo[] | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  function sortTodos(todoList: Todo[]) {
    const priorityOrder = ["high", "medium", "low"];

    todoList.sort((a, b) => {
      const getPriorityValue = (priority: string) => {
        if (priority == null) return priorityOrder.length;
        const index = priorityOrder.indexOf(priority);
        return index === -1 ? priorityOrder.length : index;
      };

      if (a.priority == null) return 1;
      if (b.priority == null) return -1;

      return getPriorityValue(a.priority) - getPriorityValue(b.priority);
    });
    todoList.sort((a, b) => {
      if (a.date == null) return 1;
      if (b.date == null) return -1;
      return b.date.localeCompare(a.date);
    });

    todoList.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      return 0;
    });

    setTodos(todoList);
  }

  async function fetchTodos() {
    if (todos?.length != 0) {
      const result = await client.graphql({
        query: listTodos,
      });

      const listOfTodos = result.data.listTodos.items;
      sortTodos(listOfTodos);
    }
  }

  async function updateCompleted(id: string) {
    if (todos) {
      var item = todos.find((x) => x.id === id);
      const updatedTodos = todos?.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      );

      sortTodos(updatedTodos);

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
      <div className="todoList">
        <div className="addTodo" onClick={() => setIsAddModalOpen(true)}>
          <img src={plus} alt="plus sign" />
        </div>
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
