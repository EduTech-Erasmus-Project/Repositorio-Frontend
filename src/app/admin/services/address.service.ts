import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Campus } from "src/app/core/interfaces/campus";
import { City } from "src/app/core/interfaces/city";
import { Country } from "src/app/core/interfaces/country";
import { Province } from "src/app/core/interfaces/province";
import { University } from "src/app/core/interfaces/university";

const baseUrl = environment.baseUrl;

type CityPayload = Partial<City> & {
  country?: number;
  province?: number;
};

@Injectable({
  providedIn: "root",
})
/**
 * Servicio administrativo para catálogos geográficos e institucionales.
 *
 * Expone tanto colecciones activas para formularios públicos como CRUD
 * completo para países, provincias, ciudades, universidades y campus.
 */
export class AddressService {
  constructor(private readonly http: HttpClient) {}

  getCitiesActive() {
    return this.http.get<City[]>(`${baseUrl}/address/cities/active`);
  }
  getUniversitiesByCityActive(id: number) {
    return this.http.get<University[]>(`${baseUrl}/address/universities-by-city/${id}`);
  }
  getCampusByUniversityActive(id: number, cityId?: number | null) {
    const cityQuery = cityId ? `?city=${cityId}` : "";
    return this.http.get<Campus[]>(`${baseUrl}/address/campus/active/${id}${cityQuery}`);
  }

  getUniversitiesActive() {
    return this.http.get<University[]>(`${baseUrl}/address/universities/active`);
  }

  getCampusActive() {
    return this.http.get<Campus[]>(`${baseUrl}/address/campus/active`);
  }

  getAllCountries() {
    return this.http.get<Country[]>(`${baseUrl}/address/countries/`);
  }

  getCountryById(id: number) {
    return this.http.get<Country>(`${baseUrl}/address/countries/${id}`);
  }

  createCountry(data: Partial<Country>) {
    return this.http.post<Country>(`${baseUrl}/address/countries/`, data);
  }

  updateCountry(id: number, data: Partial<Country>) {
    return this.http.put<Country>(`${baseUrl}/address/countries/${id}`, data);
  }

  deleteCountry(id: number) {
    return this.http.delete(`${baseUrl}/address/countries/${id}`);
  }

  getCountriesActive() {
    return this.http.get<Country[]>(`${baseUrl}/address/countries/active`);
  }

  getAllProvinces() {
    return this.http.get<Province[]>(`${baseUrl}/address/province/`);
  }

  getProvinceById(id: number) {
    return this.http.get<Province>(`${baseUrl}/address/province/${id}`);
  }

  createProvince(data: Partial<Province>) {
    return this.http.post<Province>(`${baseUrl}/address/province/`, data);
  }

  updateProvince(id: number, data: Partial<Province>) {
    return this.http.put<Province>(`${baseUrl}/address/province/${id}`, data);
  }

  deleteProvince(id: number) {
    return this.http.delete(`${baseUrl}/address/province/${id}`);
  }

  getProvincesActive() {
    return this.http.get<Province[]>(`${baseUrl}/address/province/active`);
  }

  getAllCities() {
    return this.http.get<City[]>(`${baseUrl}/address/city/`);
  }

  getCityById(id: number) {
    return this.http.get<City>(`${baseUrl}/address/city/${id}`);
  }

  createCity(data: CityPayload) {
    return this.http.post<City>(`${baseUrl}/address/city/`, data);
  }

  updateCity(id: number, data: CityPayload) {
    return this.http.put<City>(`${baseUrl}/address/city/${id}`, data);
  }

  deleteCity(id: number) {
    return this.http.delete(`${baseUrl}/address/city/${id}`);
  }

  getProvincesByCountry(id:number){
    return this.http.get<Province[]>(`${baseUrl}/address/province/country/${id}`);
  }

  getAllUniversities() {
    return this.http.get<University[]>(`${baseUrl}/address/university/`);
  }

  getUniversityById(id: number) {
    return this.http.get<University>(`${baseUrl}/address/university/${id}`);
  }

  createUniversity(data: Partial<University>) {
    return this.http.post<University>(`${baseUrl}/address/university/`, data);
  }

  updateUniversity(id: number, data: Partial<University>) {
    return this.http.put<University>(`${baseUrl}/address/university/${id}`, data);
  }

  deleteUniversity(id: number) {
    return this.http.delete(`${baseUrl}/address/university/${id}`);
  }

  getAllCampus() {
    return this.http.get<Campus[]>(`${baseUrl}/address/campus/`);
  }

  getCampusById(id: number) {
    return this.http.get<Campus>(`${baseUrl}/address/campus/${id}`);
  }

  createCampus(data: Partial<Campus>) {
    return this.http.post<Campus>(`${baseUrl}/address/campus/`, data);
  }

  updateCampus(id: number, data: Partial<Campus>) {
    return this.http.put<Campus>(`${baseUrl}/address/campus/${id}`, data);
  }

  deleteCampus(id: number) {
    return this.http.delete(`${baseUrl}/address/campus/${id}`);
  }
}
