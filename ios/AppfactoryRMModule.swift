//
//  AppfactoryRMModule.swift
//  AppfactoryRMModule
//
//  Copyright © 2022 Brijesh. All rights reserved.
//

import Foundation

@objc(AppfactoryRMModule)
class AppfactoryRMModule: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
