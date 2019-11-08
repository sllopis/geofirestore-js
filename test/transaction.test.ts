import * as chai from 'chai';

import { GeoTransaction } from '../src/transaction';
import { 
  afterEachHelper, beforeEachHelper, collection, dummyData,
  geocollection, geofirestore, invalidFirestores, stubDatabase, wait
} from './common';

const expect = chai.expect;

describe('GeoTransaction Tests:', () => {
  // Reset the Firestore before each test
  beforeEach((done) => {
    beforeEachHelper(done);
  });

  afterEach((done) => {
    afterEachHelper(done);
  });

  describe('Constructor:', () => {
    it('Constructor throws errors given invalid Firestore Transaction references', () => {
      invalidFirestores.forEach((invalid) => {
        // @ts-ignore
        expect(() => new GeoTransaction(invalid)).to.throw(null, 'Transaction must be an instance of a Firestore Transaction');
      });
    });

    it('Constructor does not throw errors given valid Firestore Transaction reference', () => {
      expect(() => geofirestore.runTransaction((transaction) => {
        const geotransaction = new GeoTransaction(transaction);
        return Promise.resolve(true);
      })).not.to.throw();
    });
  });

  describe('delete():', () => {
    it('delete() removes a document from a Firestore collection when given a GeoDocumentReference', () => {
      const dummyDoc = dummyData[0];
      const docRef = geocollection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            geotransaction.delete(docRef);
          });
        })
          .then(() => wait())
          .then(() => docRef.get())
          .then((doc) => {
            expect(doc.exists).to.be.equal(false);
            return Promise.resolve(true);
          });
        });
    });

    it('delete() removes a document from a Firestore collection when given a DocumentReference', () => {
      const dummyDoc = dummyData[0];
      const docRef = collection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            geotransaction.delete(docRef);
          });
        })
          .then(() => wait())
          .then(() => docRef.get())
          .then(doc => {
            expect(doc.exists).to.be.equal(false);
            return Promise.resolve(true);
          });
      });
    });
  });

  describe('get():', () => {
    it('get() reads a document from a Firestore collection when given a GeoDocumentReference', () => {
      const dummyDoc = dummyData[0];
      const docRef = geocollection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc);
            geotransaction.update(docRef, dummyDoc);
          });
        });
      });
    });

    it('get() reads a document from a Firestore collection when given a DocumentReference', () => {
      const dummyDoc = dummyData[0];
      const docRef = collection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc);
            geotransaction.update(docRef, dummyDoc);
          });
        });
      });
    });
  });

  describe('set():', () => {
    it('set() writes to a document from a Firestore collection when given a GeoDocumentReference', () => {
      const dummyDoc = dummyData[0];
      const dummyDoc2 = dummyData[1];
      const docRef = geocollection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc);
            geotransaction.set(docRef, dummyDoc2);
          });
        })
          .then(() => wait())
          .then(() => docRef.get())
          .then(doc => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc2);
            return Promise.resolve(true);
          });
      });
    });

    it('set() writes to a document from a Firestore collection when given a DocumentReference', () => {
      const dummyDoc = dummyData[0];
      const dummyDoc2 = dummyData[1];
      const docRef = collection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc);
            geotransaction.set(docRef, dummyDoc2);
          });
        })
          .then(() => wait())
          .then(() => docRef.get())
          .then(doc => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data().d).to.deep.equal(dummyDoc2);
            return Promise.resolve(true);
          });
      });
    });

    it('set() creates a new document if no document existed before', () => {
      const dummyDoc = dummyData[0];
      const docRef = geocollection.doc(dummyDoc.key);
      return geofirestore.runTransaction((transaction) => {
        const geotransaction = new GeoTransaction(transaction);
        return geotransaction.get(docRef).then((doc) => {
          expect(doc.exists).to.be.equal(false);
          geotransaction.set(docRef, dummyDoc);
        });
      })
        .then(() => wait())
        .then(() => docRef.get())
        .then((doc) => {
          expect(doc.exists).to.be.equal(true);
          expect(doc.data()).to.deep.equal(dummyDoc);
          return Promise.resolve(true);
        });
    });
  });

  describe('update():', () => {
    it('update() writes to a document from a Firestore collection when given a GeoDocumentReference', () => {
      const dummyDoc = dummyData[0];
      const dummyDoc2 = dummyData[1];
      const docRef = geocollection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc);
            geotransaction.update(docRef, dummyDoc2);
          });
        })
          .then(() => wait())
          .then(() => docRef.get())
          .then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc2);
            return Promise.resolve(true);
          });
      });
    });

    it('update() writes to a document from a Firestore collection when given a DocumentReference', () => {
      const dummyDoc = dummyData[0];
      const dummyDoc2 = dummyData[1];
      const docRef = collection.doc(dummyDoc.key);
      return stubDatabase().then(() => {
        return geofirestore.runTransaction((transaction) => {
          const geotransaction = new GeoTransaction(transaction);
          return geotransaction.get(docRef).then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data()).to.deep.equal(dummyDoc);
            geotransaction.update(docRef, dummyDoc2);
          });
        })
          .then(() => wait())
          .then(() => docRef.get())
          .then((doc) => {
            expect(doc.exists).to.be.equal(true);
            expect(doc.data().d).to.deep.equal(dummyDoc2);
            return Promise.resolve(true);
          });
      });
    });

    it('update() fails if no document existed before', () => {
      const dummyDoc = dummyData[0];
      const docRef = geocollection.doc(dummyDoc.key);
      let isDone = false;
      return geofirestore.runTransaction((transaction) => {
        const geotransaction = new GeoTransaction(transaction);
        return geotransaction.get(docRef).then((doc) => {
          expect(doc.exists).to.be.equal(false);
          geotransaction.update(docRef, dummyDoc);
        });
      })
        .catch((e) => {
          expect(e).to.not.be.equal(null);
          expect(e).to.not.be.equal(undefined);
          if (!isDone) {
            isDone = true;
            return Promise.resolve(isDone);
          }
        });
    });
  });
});

