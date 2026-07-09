import React, { useEffect, useState } from "react";
import api from "../api/api";

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");

  useEffect(() => {
    getExercises();
  }, []);

  const getExercises = async () => {
    try {
      const response = await api.get("/exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Egzersiz getirme hatası:", error);
    }
  };

  const addExercise = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Hareket adı boş olamaz.");
      return;
    }

    try {
      await api.post("/exercises", {
        name,
        muscle_group: muscleGroup,
      });

      setName("");
      setMuscleGroup("");
      getExercises();
    } catch (error) {
      console.error("Egzersiz ekleme hatası:", error);
    }
  };

  return (
    <div className="card">
      <h2>Egzersizler</h2>

      <form className="mini-form" onSubmit={addExercise}>
        <input
          type="text"
          placeholder="Hareket adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Kas grubu"
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
        />

        <button type="submit">Ekle</button>
      </form>

      <div className="exercise-list">
        {exercises.map((exercise) => (
          <div className="exercise-item" key={exercise.id}>
            <strong>{exercise.name}</strong>
            <span>{exercise.muscle_group || "Genel"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExerciseList;