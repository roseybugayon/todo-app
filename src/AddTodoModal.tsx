import { generateClient } from "aws-amplify/api";
import { format } from "date-fns";
import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiFillCloseCircle, AiOutlineCalendar } from "react-icons/ai";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";
import { Todo } from "./API";
import { createTodo } from "./graphql/mutations";
import "./styles/AddTodoModal.css";

interface TodoDateProps {
  formattedDate: string;
  clear: () => void;
  handleDateChange: (event: any) => void;
  onClick?: () => void;
}

const TodoDate = forwardRef<HTMLDivElement, TodoDateProps>(
  ({ formattedDate, clear, handleDateChange, onClick }, ref) => (
    <div className="date" ref={ref}>
      <p>{formattedDate}</p>

      <div className="icons">
        {formattedDate ? (
          <AiFillCloseCircle className="closeCal" onClick={clear} />
        ) : (
          <div className="filler" />
        )}

        <AiOutlineCalendar
          onClick={onClick}
          onChange={handleDateChange}
          className="dayPicker"
        />
      </div>
    </div>
  )
);

interface AddTodoModalProps {
  isOpen: boolean;
  closeModal: () => void;
  fetchTodos: () => Promise<void>;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "650px",
    height: "250px",
    borderRadius: "18px",
    boxShadow: "1px 3px 10px 0.1px rgba(0, 0, 0, 0.2)",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(75, 74, 74, 0.2)",
  },
};

const client = generateClient();

export default function AddTodoModal(props: AddTodoModalProps) {
  const { isOpen, closeModal, fetchTodos } = props;

  const [formattedDate, setFormattedDate] = useState<string>(
    format(new Date(), "MMM dd, yyyy")
  );

  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [task, setTask] = useState<string | undefined>(undefined);
  const [taskValid, setTaskValid] = useState<boolean>(true);
  const [prioritySelected, setPrioritySelected] = useState<string>("");

  const handlePriorityChange = (value: string) => {
    if (prioritySelected === value) {
      setPrioritySelected("");
    } else {
      setPrioritySelected(value);
    }
  };

  const handleDateChange = (event: any) => {
    console.log(event);
    if (event) {
      setFormattedDate(format(event, "MM/dd/yyyy"));
    }
    setDate(format(event, "yyyy-MM-dd"));
  };

  const validateTask = () => {
    if (task === "" || task == undefined) {
      setTaskValid(false);
    }
  };

  const handleChangeTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (task !== "") {
      setTaskValid(true);
    }
    setTask(event.target.value);
  };

  const clear = () => {
    setDate("");
    setFormattedDate("");
  };

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (task === "" || task == undefined) {
      setTaskValid(false);
    } else {
      const result = await client.graphql({
        query: createTodo,
        variables: {
          input: {
            description: task,
            date: date,
            id: uuidv4(),
            priority: prioritySelected,
          },
        },
      });

      console.log(result);
      await fetchTodos();
      closeModal();
    }
  }

  return (
    <Modal isOpen={isOpen} style={customStyles} ariaHideApp={false}>
      <div className="modalContent">
        <h2>Create Task</h2>
        <form action="submit" className="addTodoForm">
          <label htmlFor="task">
            Task:
            <input
              type="text"
              onBlur={validateTask}
              onChange={handleChangeTask}
              className={`${!taskValid ? "invalid" : ""}`}
            />
          </label>
          <div className="bottomInputs">
            <label htmlFor="date">
              Date:
              <DatePicker
                onChange={handleDateChange}
                customInput={
                  <TodoDate
                    formattedDate={formattedDate}
                    clear={clear}
                    handleDateChange={handleDateChange}
                  />
                }
              />
            </label>
            <label htmlFor="priority">
              Priority:
              <ul style={{ listStyleType: "none" }}>
                <li
                  className={`priority priority-low ${
                    prioritySelected == "low" ? "priority-low-selected" : ""
                  }`}
                  onClick={() => handlePriorityChange("low")}
                >
                  LOW
                </li>
                <li
                  className={`priority priority-medium ${
                    prioritySelected == "medium"
                      ? "priority-medium-selected"
                      : ""
                  }`}
                  onClick={() => handlePriorityChange("medium")}
                >
                  MEDIUM
                </li>
                <li
                  className={`priority priority-high ${
                    prioritySelected == "high" ? "priority-high-selected" : ""
                  }`}
                  onClick={() => handlePriorityChange("high")}
                >
                  HIGH
                </li>
              </ul>
            </label>
          </div>
          <div className="bottomBtns">
            <button onClick={closeModal} className="cancel">
              Cancel
            </button>
            <button type="submit" onClick={handleSubmit} className="create">
              Create
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
