import { setDefaultTimeout, AfterAll, BeforeAll } from 'cucumber';
import { createSession, closeSession } from 'nightwatch-api';

setDefaultTimeout(60000);

BeforeAll(async () => {
	await createSession('drone');
});

AfterAll(async () => {
	await closeSession();
});
