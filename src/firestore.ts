import { GeoFirestoreTypes } from './geofirestoretypes';
import { GeoCollectionReference } from './collectionreference';
import { GeoDocumentReference } from './documentreference';
import { GeoQuery } from './query';
import { GeoWriteBatch } from './writebatch';

/**
 * `GeoFirestore` represents a Cloud Firestore Interface and is the
 * entry point for all GeoFirestore operations.
 */
export class GeoFirestore {
  /**
   * @param native Firestore represents a Firestore Database and is the
   * entry point for all Firestore operations.
   */
  constructor(readonly native: GeoFirestoreTypes.web.Firestore | GeoFirestoreTypes.cloud.Firestore) {
    if (Object.prototype.toString.call(native) !== '[object Object]') {
      throw new Error('Firestore must be an instance of Firestore');
    }
  }

  /**
   * Creates a write batch, used for performing multiple writes as a single
   * atomic operation. The maximum number of writes allowed in a single WriteBatch
   * is 500, but note that each usage of `FieldValue.serverTimestamp()`,
   * `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
   * `FieldValue.increment()` inside a WriteBatch counts as an additional write.
   *
   * @return
   *   A `GeoWriteBatch` that can be used to atomically execute multiple writes.
   */
  batch(): GeoWriteBatch {
    return new GeoWriteBatch(this.native.batch());
  }

  /**
   * Gets a `GeoCollectionReference` instance that refers to the collection at
   * the specified path.
   *
   * @param collectionPath A slash-separated path to a collection.
   * @return The `GeoCollectionReference` instance.
   */
  collection(collectionPath: string): GeoCollectionReference {
    return new GeoCollectionReference(this.native.collection(collectionPath));
  }

  /**
   * Creates and returns a new GeoQuery that includes all documents in the
   * database that are contained in a collection or subcollection with the
   * given collectionId.
   *
   * @param collectionId Identifies the collections to query over. Every
   * collection or subcollection with this ID as the last segment of its path
   * will be included. Cannot contain a slash.
   * @return The created GeoQuery.
   */
  collectionGroup(collectionId: string): GeoQuery {
    return new GeoQuery(this.native.collectionGroup(collectionId));
  }

  /**
   * Gets a `GeoDocumentReference` instance that refers to the document at the
   * specified path.
   *
   * @param documentPath A slash-separated path to a document.
   * @return The `GeoDocumentReference` instance.
   */
  doc(documentPath: string): GeoDocumentReference {
    return new GeoDocumentReference(this.native.doc(documentPath));
  }

  /**
   * Executes the given `updateFunction` and then attempts to commit the changes
   * applied within the transaction. If any document read within the transaction
   * has changed, Cloud Firestore retries the `updateFunction`. If it fails to
   * commit after 5 attempts, the transaction fails.
   *
   * The maximum number of writes allowed in a single transaction is 500, but
   * note that each usage of `FieldValue.serverTimestamp()`,
   * `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
   * `FieldValue.increment()` inside a transaction counts as an additional write.
   * 
   * @example
   * ```typescript
   * const geofirestore = new GeoFirestore(firebase.firestore());
   * const sfDocRef = geofirestore.collection('cities').doc('SF');
   * 
   * geofirestore.runTransaction((transaction) => {
   *  // Immediateley create a `GeoTransaction` from the `transaction`
   *  const geotransaction = new GeoTransaction(transaction);
   *  // This code may get re-run multiple times if there are conflicts.
   *  return geotransaction.get(sfDocRef).then((sfDoc) => {
   *    if (!sfDoc.exists) {
   *      throw Error('Document does not exist!');
   *    }
   *    const newPopulation = sfDoc.data().population + 1;
   *    geotransaction.update(sfDocRef, { population: newPopulation });
   *  });
   * });
   * ```
   *
   * @param updateFunction
   *   The function to execute within the transaction context.
   *
   * @return
   *   If the transaction completed successfully or was explicitly aborted
   *   (the `updateFunction` returned a failed promise),
   *   the promise returned by the updateFunction is returned here. Else, if the
   *   transaction failed, a rejected promise with the corresponding failure
   *   error will be returned.
   */
  runTransaction<T>(
    updateFunction: (transaction: GeoFirestoreTypes.cloud.Transaction | GeoFirestoreTypes.web.Transaction) => Promise<T>
  ): Promise<T> {
    return (this.native as GeoFirestoreTypes.cloud.Firestore).runTransaction(updateFunction);
  }

  /**
   * @TODO
   * Specifies custom settings to be used to configure the `GeoFirestore`
   * instance. Must be set before invoking any other methods.
   *
   * @param settings The settings to use.
   */
  settings(settings: any): void {}
}
