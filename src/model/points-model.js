import dayjs from 'dayjs';
import Observable from '../framework/observable';
import { generationPoints } from '../mocks/point-mock';
import { UpdateType } from '../const/points-const';


export default class PointsModel extends Observable {

  #points = [];
  #offers = [];
  #destinations = [];
  #pointApiService = null;

  constructor({pointApiService}) {
    super();
    this.#pointApiService = pointApiService;
  }

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      const points = await this.#pointApiService.points;
      this.#destinations = await this.#pointApiService.destinations;
      this.#offers = await this.#pointApiService.offers;
      this.#points = points.map(this.#adaptToClient);
    }catch(err){
      this.#points = [];
      this.#offers = [];
      this.#destinations = [];
    }

    this._notify(UpdateType.INIT);
  }

  updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if(index === -1){
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update){
    this.#points = [update, ...this.#points];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if(index === -1){
      throw new Error('Can\'t delete unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, update);
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? dayjs(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? dayjs(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite']
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }

}