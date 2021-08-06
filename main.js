"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, long]
    this.distance = distance; // km
    this.duration = duration; // minutes
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    //km/min

    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Walking extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    //km/min

    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Inline extends Workout {
  constructor(coords, distance, duration, stride) {
    super(coords, distance, duration);
    this.stride = stride;
    this.calcStride();
  }

  calcStride() {
    //km/min

    this.stride = this.duration / this.distance;
    return this.stride;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
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
  constructor() {
    this._getPosition();

    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleField);
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
    e.preventDefault();

    // clear input
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
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
      .setPopupContent("Workout")
      .openPopup();
  }
}

const app = new App();

//display marker
