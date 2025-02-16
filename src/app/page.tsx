"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";


type Habit = {
  id: string;
  name: string;
  count: number;
};

interface Goal {
  id: number;
  text: string;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const HabitsComponent = () => {
  const [habitsByDate, setHabitsByDate] = useState<{ [key: string]: Habit[] }>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    const savedHabitsByDate = localStorage.getItem("habitsByDate");

    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedHabitsByDate) setHabitsByDate(JSON.parse(savedHabitsByDate));
  }, []);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("habitsByDate", JSON.stringify(habitsByDate));
  }, [habitsByDate]);

  const addHabit = () => {
    if (!newHabit.trim()) return;

    const habit = { id: uuidv4(), name: newHabit, count: 0 };
    setHabits((prevHabits) => [...prevHabits, habit]);
    setNewHabit("");
  };

  const addHabitForDate = (habitId: string, habitName: string) => {
    setHabitsByDate((prev) => {
      const habitsForToday = prev[currentDate] || [];
      const existingHabitIndex = habitsForToday.findIndex((habit) => habit.id === habitId);

      let updatedHabits;
      if (existingHabitIndex !== -1) {
        updatedHabits = habitsForToday.map((habit, index) =>
          index === existingHabitIndex ? { ...habit, count: habit.count + 1 } : habit
        );
      } else {
        updatedHabits = [...habitsForToday, { id: habitId, name: habitName, count: 1 }];
      }

      return { ...prev, [currentDate]: updatedHabits };
    });
  };

  const changeDate = (days: number) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate.toISOString().split("T")[0];
    });
  };

  const chartData = habits.map((habit) => {
    const totalExecutions = Object.values(habitsByDate).reduce((sum, dailyHabits) => {
      const habitForDate = dailyHabits.find((h) => h.id === habit.id);
      return sum + (habitForDate ? habitForDate.count : 0);
    }, 0);

    return {
      name: habit.name,
      total: totalExecutions,
    };
  });

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-4">Habits</h2>
      <div className="w-full max-w-2xl space-y-4">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <button onClick={() => changeDate(-1)} className="text-blue-500">◀</button>
          <span>{currentDate}</span>
          <button onClick={() => changeDate(1)} className="text-blue-500">▶</button>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-start">
          <input
            className="w-full bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="New Habit"
          />
          <button
            onClick={addHabit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center gap-2"
          >
            ➕ Add Habit
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
          {habits.map((habit) => {
            const isChecked = habitsByDate[currentDate]?.some((h) => h.id === habit.id && h.count > 0) || false;

            return (
              <div key={habit.id} className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => addHabitForDate(habit.id, habit.name)}
                  className="form-checkbox"
                />
                <span>{habit.name}</span>
              </div>
            );
          })}
        </div>

        {chartData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Total Executions per Habit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const GoalsComponent = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    const storedGoals = JSON.parse(localStorage.getItem("goals") || "[]");
    setGoals(storedGoals);
  }, []);

  const addGoal = () => {
    if (newGoal.trim() === "") return;
    const updatedGoals = [...goals, { id: Date.now(), text: newGoal }];
    setGoals(updatedGoals);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
    setNewGoal("");
  };

  const removeGoal = (id: number) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-4">Goals</h2>
      <div className="w-full max-w-2xl space-y-4">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-start">
          <input
            className="w-full bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="New goal"
          />
          <button
            onClick={addGoal}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center gap-2"
          >
            ➕ Add Goal
          </button>
        </div>

        <div className="w-full max-w-2xl space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-start justify-between">
              <span className="text-white">{goal.text}</span>
              <button
                onClick={() => removeGoal(goal.id)}
                className="text-red-500 hover:text-red-700"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TasksComponent = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    setTasks(storedTasks);
  }, []);

  const addTask = () => {
    if (newTask.trim() === "") return;
    const updatedTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setNewTask("");
  };

  const removeTask = (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  const toggleTaskCompletion = (id: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col gap-4">
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      <div className="w-full max-w-2xl space-y-4">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-start">
          <input
            className="w-full bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task"
          />
          <button
            onClick={addTask}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center gap-2"
          >
            ➕ Add Task
          </button>
        </div>

        <div className="w-full max-w-2xl space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="form-checkbox"
                />
                <span className={task.completed ? "line-through text-gray-500" : "text-white"}>{task.text}</span>
              </div>
              <button
                onClick={() => removeTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NotesComponent = () => {
  const [notes, setNotes] = useState<string[]>([""]);

  const addNote = () => setNotes([...notes, ""]);

  const updateNote = (index: number, value: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = value;
    setNotes(updatedNotes);
  };

  const removeNote = (index: number) => {
    const filteredNotes = notes.filter((_, i) => i !== index);
    setNotes(filteredNotes.length ? filteredNotes : [""]);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-4">Minimal Notes</h1>
      <div className="w-full max-w-2xl space-y-4">
        {notes.map((note, index) => (
          <div key={index} className="bg-gray-800 rounded-2xl shadow-lg p-4 flex items-start">
            <div className="w-full flex flex-col gap-2">
              <textarea
                className="w-full bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={note}
                onChange={(e) => updateNote(index, e.target.value)}
                placeholder="Write your note here..."
              />
              <button
                className="self-end text-red-400 hover:text-red-500"
                onClick={() => removeNote(index)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addNote}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center gap-2"
        >
          ➕ Add Note
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-r from-indigo-100 to-blue-100 flex flex-col gap-4">

      <div className="flex justify-center items-center mb-6">
        <img src="/path/to/logo.png" alt="Logo" className="h-12" />
      </div>
      <h1 className="text-3xl font-bold text-center">Productivity Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HabitsComponent/>
        <GoalsComponent/>
        <TasksComponent/>         
        <NotesComponent/>
      </div>
    </div>
  );
}