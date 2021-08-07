"use strict";

// prettier-ignore

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const inputStride = document.querySelector(".form__input--stride");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, long]
    this.distance = distance; // km
    this.duration = duration; // minutes
  }

  _setDescription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //km/min

    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Walking extends Workout {
  type = "walking";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //km/min

    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Inline extends Workout {
  type = "inline";
  constructor(coords, distance, duration, stride) {
    super(coords, distance, duration);
    this.stride = stride;
    this.calcStride();
    this._setDescription();
  }

  calcStride() {
    //km/min

    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //km/min

    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([39, 22], 20, 24, 179);
const cycling1 = new Cycling([39, 22], 15, 95, 500);

console.log(run1, cycling1);

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();

    this._getLocalStorage();

    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleField);

    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
    }

    console.log("get position was called");
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(
      `https://www.google.ca/maps/place/Jane+and+Finch,+Toronto,+ON/@${latitude},${longitude}`
    );

    this.#map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup("A pretty CSS3 popup.<br> Easily customizable.")
      .openPopup();

    console.log("load map was called");
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleField() {
    if (inputType.value === "walking" || inputType.value === "running") {
      inputCadence.closest(".form__row").classList.remove("form__row--hidden");
      inputElevation.closest(".form__row").classList.add("form__row--hidden");
      inputStride.closest(".form__row").classList.add("form__row--hidden");
    } else if (inputType.value === "cycling") {
      inputCadence.closest(".form__row").classList.add("form__row--hidden");
      inputElevation
        .closest(".form__row")
        .classList.remove("form__row--hidden");
      inputStride.closest(".form__row").classList.add("form__row--hidden");
    } else if (inputType.value === "inline") {
      inputCadence.closest(".form__row").classList.add("form__row--hidden");
      inputElevation.closest(".form__row").classList.add("form__row--hidden");
      inputStride.closest(".form__row").classList.remove("form__row--hidden");
    }
  }

  _newWorkout(e) {
    const validInputs = (...inputs) => {
      return inputs.every((inp) => Number.isFinite(inp));
    };

    const allPositive = (...inputs) => {
      return inputs.every((inp) => inp > 0);
    };

    const logInputs = (...inputs) => {
      inputs.forEach(function (inp) {
        console.log(inp);
      });
    };

    e.preventDefault();

    // get data from form

    const type = inputType.value;
    const duration = Number(inputDuration.value);
    const distance = Number(inputDistance.value);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    console.log(type);

    if (type === "running" || type === "walking") {
      const cadence = Number(inputCadence.value);

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Inputs have to be positive numbers");
      }
      if (type === "running") {
        workout = new Running([lat, lng], distance, duration, cadence);
        this.#workouts.push(workout);
      } else {
        workout = new Walking([lat, lng], distance, duration, cadence);
        this.#workouts.push(workout);
      }
    } else if (type === "cycling") {
      const elevation = Number(inputElevation.value);

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Inputs have to be positive numbers");
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);
    } else if (type === "inline") {
      const stride = Number(inputStride.value);
      if (
        !validInputs(distance, duration, stride) ||
        !allPositive(distance, duration, stride)
      ) {
        return alert("Inputs have to be positive numbers");
      }
      workout = new Inline([lat, lng], distance, duration, stride);
      this.#workouts.push(workout);
    }
    this._renderWorkoutMarker(workout);

    this._renderWorkout(workout);

    this._hideForm();

    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${inputType.value}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    let excercise;
    if (workout.type === "running") {
      excercise = "🏃‍♂️";
    }
    if (workout.type === "cycling") excercise = "🚴‍♀️";
    if (workout.type === "inline") excercise = "⛸️";
    if (workout.type === "walking") excercise = "🚶‍♀️";

    let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${excercise}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === "running") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }

    if (workout.type === "walking") {
      html += `<div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace.toFixed(1)}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
          </li>`;
    }

    if (workout.type === "cycling") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    if (workout.type === "inline") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛷️</span>
            <span class="workout__value">${workout.stride}</span>
            <span class="workout__unit">stridepm</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML("afterend", html);
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });

    //api

    workout.click();
  }
  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach((work) => {
      this._renderWorkout(work);
    });
  }
}

const app = new App();
