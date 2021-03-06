const utils = require('./utils')

const Subscription = artifacts.require('Subscription');
const SubscriptionRegistry = artifacts.require('SubscriptionRegistry');

contract('SubscriptionRegistry', function(accounts) {
  let subscriptionRegistry;

  let analyst = accounts[1];
  let subscriber1 = accounts[2];
  let subscriber2 = accounts[3];

  beforeEach(async () => {
    subscriptionRegistry = await SubscriptionRegistry.new();
  })

  /** subscribe() **/
  it("should subscribe", async () => {
    transaction = await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });

    var log = utils.getEventLogs(transaction, 'LogSubscription')[0];
    assert.equal(log.args.requester, subscriber1, subscriber1 + " should be the requester");
    assert.equal(log.args.subscriber, subscriber1, subscriber1 + " should also be the subscriber");
    assert.equal(log.args.analyst, analyst, analyst + " should be the analyst");
    assert.equal(log.args.calls, 5, "calls should be 5");

    count = await subscriptionRegistry.countSubscriptions({
      from: analyst
    });
    assert.equal(count, 1, "subscription count should be 1");
  });

  it("should not subscribe: self subscription", async () => {
    try {
      await subscriptionRegistry.subscribe(analyst, 5, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not subscribe: invalid number of calls", async () => {
    try {
      await subscriptionRegistry.subscribe(analyst, 0, {
        from: subscriber1
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  /** countSubscriptions() **/
  it("should count subscriptions", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    count = await subscriptionRegistry.countSubscriptions({
      from: analyst
    });
    assert.equal(count, 1, "subscription count should be 1");
  });

  it("should count subscriptions: no analyst data", async () => {
    count = await subscriptionRegistry.countSubscriptions({
      from: analyst
    });
    assert.equal(count, 0, "subscription count should be 0");
  });

  /** getSubscriberByIndex() **/
  it("should get subscriber's address by index", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    transaction = await subscriptionRegistry.subscribe(analyst, 3, {
      from: subscriber2
    });

    subscriber = await subscriptionRegistry.getSubscriberByIndex(1, {
      from: analyst
    });

    var log = utils.getEventLogs(transaction, 'LogSubscription')[0];
    assert.equal(log.args.subscriber, subscriber, subscriber + " should be the subscriber");
    assert.equal(subscriber, subscriber2, subscriber + " should be " + subscriber2);
  });

  it("should not get subscriber's address by index: no analyst data", async () => {
    try {
      transaction = await subscriptionRegistry.getSubscriberByIndex(1, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not get subscriber's address by index: unknown index", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      transaction = await subscriptionRegistry.getSubscriberByIndex(1, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not get subscriber's address by index: negative index ", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      transaction = await subscriptionRegistry.getSubscriberByIndex(-1, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  /** getSubscriptionByIndex() **/
  it("should get subscription by index", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    transaction = await subscriptionRegistry.subscribe(analyst, 3, {
      from: subscriber2
    });

    subscription = await subscriptionRegistry.getSubscriptionByIndex(1, {
      from: analyst
    });

    var log = utils.getEventLogs(transaction, 'LogSubscription')[0];
    assert.equal(log.args.subscription, subscription, subscription + " should be contract address");
  });

  it("should not get subscription by index: no analyst data", async () => {
    try {
      await subscriptionRegistry.getSubscriptionByIndex(1, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not get subscription by index: unknown index", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      await subscriptionRegistry.getSubscriptionByIndex(1, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not get subscription by index: negative index ", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      await subscriptionRegistry.getSubscriptionByIndex(-1, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  /** getSubscriptionByAddress() **/
  it("should get subscription by address", async () => {
    transaction = await subscriptionRegistry.subscribe(analyst, 3, {
      from: subscriber2
    });

    subscription = await subscriptionRegistry.getSubscriptionByAddress(subscriber2, {
      from: analyst
    });

    var log = utils.getEventLogs(transaction, 'LogSubscription')[0];
    assert.equal(log.args.subscription, subscription, subscription + " should be contract address");
  });

  it("should not get subscription by address: no analyst data", async () => {
    try {
      await subscriptionRegistry.getSubscriptionByAddress(subscriber2, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not get subscription by address: unknown subscriber", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      await subscriptionRegistry.getSubscriptionByAddress(subscriber2, {
        from: analyst
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  /** getSubscriptionFromAddress() **/
  it("should get subscription from address", async () => {
    transaction = await subscriptionRegistry.subscribe(analyst, 3, {
      from: subscriber2
    });

    subscription = await subscriptionRegistry.getSubscriptionFromAddress(analyst, {
      from: subscriber2
    });

    var log = utils.getEventLogs(transaction, 'LogSubscription')[0];
    assert.equal(log.args.subscription, subscription, subscription + " should be contract address");
  });

  it("should not get subscription from address: no analyst data", async () => {
    try {
      await subscriptionRegistry.getSubscriptionFromAddress(analyst, {
        from: subscriber2
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not get subscription from address: unknown analyst", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      await subscriptionRegistry.getSubscriptionFromAddress(subscriber2, {
        from: subscriber1
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  /** unsubscribe() **/
  it("should unsubscribe", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    transaction = await subscriptionRegistry.unsubscribe(analyst, {
      from: subscriber1
    });

    var log = utils.getEventLogs(transaction, 'LogUnsubscription')[0];
    assert.equal(log.args.requester, subscriber1, subscriber1 + " should be the requester");
    assert.equal(log.args.subscriber, subscriber1, subscriber1 + " should also be the subscriber");
    assert.equal(log.args.analyst, analyst, analyst + " should be the analyst");
    assert.equal(log.args.calls, 5, "calls should be 5");

    count = await subscriptionRegistry.countSubscriptions({
      from: analyst
    });
    assert.equal(count, 0, "subscription count should be 0");
  });

  it("should not subscribe: no analyst data", async () => {
    try {
      await subscriptionRegistry.unsubscribe(analyst, {
        from: subscriber1
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

  it("should not subscribe: not subscribed", async () => {
    await subscriptionRegistry.subscribe(analyst, 5, {
      from: subscriber1
    });
    try {
      await subscriptionRegistry.unsubscribe(analyst, {
        from: subscriber2
      });
      throw new Error("Should revert!");
    } catch (e) {
      assert.equal(e.toString().split(":")[2].trim(), 'revert', "Error should be: revert");
    }
  });

});
