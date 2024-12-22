declare module "geomagnetism" {
  export interface GeomagnetismPoint {
    x: number;
    y: number;
    z: number;
    h: number;
    f: number;
    incl: number;
    decl: number;
  }

  export interface GeomagnetismModel {
    epoch: number;
    start_date: Date;
    end_date: Date;
    name: string;
    main_field_coeff_g: number[];
    secular_var_coeff_h: number[];
    n_max: number;
    n_max_sec_var: number;
    num_terms: number;
    point(geoPoint: number[]): GeomagnetismPoint;
  }

  export interface GeomagnetismOptions {
    allowOutOfBoundsModel: boolean;
  }

  export function model(date?: Date, options?: GeomagnetismOptions): GeomagnetismModel;
}
