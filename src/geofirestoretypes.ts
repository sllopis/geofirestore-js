/* tslint:disable:no-import-side-effect no-namespace no-shadowed-variable */
import 'firebase-admin';
import 'firebase/app';
import '@types/node';

export namespace GeoFirestoreTypes {
  export interface Document {
    g: string;
    l: web.GeoPoint | cloud.GeoPoint;
    d: DocumentData;
  }
  export type DocumentData = {  [field: string]: any; coordinates?: cloud.GeoPoint | web.GeoPoint; } | undefined;
  export interface DocumentChange {
    doc: QueryDocumentSnapshot;
    newIndex: number;
    oldIndex: number;
    type: 'added' | 'modified' | 'removed';
  }
  export interface QueryCriteria {
    center?: cloud.GeoPoint | web.GeoPoint;
    radius?: number;
    limit?: number;
  }
  export interface QueryDocumentSnapshot {
    exists: boolean;
    id: string;
    data: () => DocumentData | any;
    distance: number;
  }
  export interface SetOptions {
    customKey?: string;
    merge?: boolean;
    mergeFields?: Array<string | cloud.FieldPath | web.FieldPath>;
  }
  export type SnapshotOptions = firebase.firestore.SnapshotOptions;
  export interface UpdateData { [fieldPath: string]: any; coordinates?: cloud.GeoPoint | web.GeoPoint; }
  export type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'array-contains-any';
  export namespace web {
    export type CollectionReference = firebase.firestore.CollectionReference;
    export type DocumentChange = firebase.firestore.DocumentChange;
    export type DocumentReference = firebase.firestore.DocumentReference;
    export type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
    export type Firestore = firebase.firestore.Firestore;
    export type FieldPath = firebase.firestore.FieldPath;
    export type GetOptions = firebase.firestore.GetOptions;
    export type GeoPoint = firebase.firestore.GeoPoint;
    export type Query = firebase.firestore.Query;
    export type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;
    export type QuerySnapshot = firebase.firestore.QuerySnapshot;
    export type Transaction = firebase.firestore.Transaction;
    export type WriteBatch = firebase.firestore.WriteBatch;
  }
  export namespace cloud {
    export type CollectionReference = FirebaseFirestore.CollectionReference;
    export type DocumentChange = FirebaseFirestore.DocumentChange;
    export type DocumentReference = FirebaseFirestore.DocumentReference;
    export type DocumentSnapshot = FirebaseFirestore.DocumentSnapshot;
    export type Firestore = FirebaseFirestore.Firestore;
    export type FieldPath = FirebaseFirestore.FieldPath;
    export type GeoPoint = FirebaseFirestore.GeoPoint;
    export type Query = FirebaseFirestore.Query;
    export type QueryDocumentSnapshot = FirebaseFirestore.QueryDocumentSnapshot;
    export type QuerySnapshot = FirebaseFirestore.QuerySnapshot;
    export type Transaction = FirebaseFirestore.Transaction;
    export type WriteBatch = FirebaseFirestore.WriteBatch;
  }
}