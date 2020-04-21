#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkAlarmStack } from '../lib/cdk-alarm-stack';

const app = new cdk.App();
new CdkAlarmStack(app, 'CdkAlarmStack');
