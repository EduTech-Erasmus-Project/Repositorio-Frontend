import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: "root",
})
export class AddressService {
  constructor(private http: HttpClient) {}

  getCitiesActive() {
    return this.http.get(`${baseUrl}/address/cities/active`);
  }
  getUniversitiesByCityActive(id: number) {
    return this.http.get(`${baseUrl}/address/universities-by-city/${id}`);
  }
  getCampusByUniversityActive(id: number) {
    return this.http.get(`${baseUrl}/address/campus/active/${id}`);
  }

  getUniversitiesActive() {
    return this.http.get(`${baseUrl}/address/universities/active`);
  }

  getCampusActive() {
    return this.http.get(`${baseUrl}/address/campus/active`);
  }

  getAllCountries() {
    return this.http.get(`${baseUrl}/address/countries/`);
  }

  getCountryById(id: number) {
    return this.http.get(`${baseUrl}/address/countries/${id}`);
  }

  createCountry(data: any) {
    return this.http.post(`${baseUrl}/address/countries/`, data);
  }

  updateCountry(id: number, data: any) {
    return this.http.put(`${baseUrl}/address/countries/${id}`, data);
  }

  deleteCountry(id: number) {
    return this.http.delete(`${baseUrl}/address/countries/${id}`);
  }

  getCountriesActive() {
    return this.http.get(`${baseUrl}/address/countries/active`);
  }

  getAllProvinces() {
    return this.http.get(`${baseUrl}/address/province/`);
  }

  getProvinceById(id: number) {
    return this.http.get(`${baseUrl}/address/province/${id}`);
  }

  createProvince(data: any) {
    return this.http.post(`${baseUrl}/address/province/`, data);
  }

  updateProvince(id: number, data: any) {
    return this.http.put(`${baseUrl}/address/province/${id}`, data);
  }

  deleteProvince(id: number) {
    return this.http.delete(`${baseUrl}/address/province/${id}`);
  }

  getProvincesActive() {
    return this.http.get(`${baseUrl}/address/province/active`);
  }

  getAllCities() {
    return this.http.get(`${baseUrl}/address/city/`);
  }

  getCityById(id: number) {
    return this.http.get(`${baseUrl}/address/city/${id}`);
  }

  createCity(data: any) {
    return this.http.post(`${baseUrl}/address/city/`, data);
  }

  updateCity(id: number, data: any) {
    return this.http.put(`${baseUrl}/address/city/${id}`, data);
  }

  deleteCity(id: number) {
    return this.http.delete(`${baseUrl}/address/city/${id}`);
  }

  getProvincesByCountry(id:number){
    return this.http.get(`${baseUrl}/address/province/country/${id}`);
  }

  // getCitiesActive() {
  //   return this.http.get(`${baseUrl}/address/province/active`);
  // }

  getAllUniversities() {
    return this.http.get(`${baseUrl}/address/university/`);
  }

  getUniversityById(id: number) {
    return this.http.get(`${baseUrl}/address/university/${id}`);
  }

  createUniversity(data: any) {
    return this.http.post(`${baseUrl}/address/university/`, data);
  }

  updateUniversity(id: number, data: any) {
    return this.http.put(`${baseUrl}/address/university/${id}`, data);
  }

  deleteUniversity(id: number) {
    return this.http.delete(`${baseUrl}/address/university/${id}`);
  }

  // getProvincesByUniversity(id:number){
  //   return this.http.get(`${baseUrl}/address/province/country/${id}`);
  // }

  // getUniversitiesActive() {
  //   return this.http.get(`${baseUrl}/address/universities/active`);
  // }

  getAllCampus() {
    return this.http.get(`${baseUrl}/address/campus/`);
  }

  getCampusById(id: number) {
    return this.http.get(`${baseUrl}/address/campus/${id}`);
  }

  createCampus(data: any) {
    return this.http.post(`${baseUrl}/address/campus/`, data);
  }

  updateCampus(id: number, data: any) {
    return this.http.put(`${baseUrl}/address/campus/${id}`, data);
  }

  deleteCampus(id: number) {
    return this.http.delete(`${baseUrl}/address/campus/${id}`);
  }
}
